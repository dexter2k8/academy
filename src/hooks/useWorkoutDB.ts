import { useState, useEffect } from 'react';
import type { Workout } from '../types/workout';

const DB_NAME = 'workoutDB';
const DB_VERSION = 1;
const WORKOUT_STORE = 'workouts';
const IMAGE_STORE = 'images';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(WORKOUT_STORE)) {
        db.createObjectStore(WORKOUT_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllWorkouts(): Promise<Workout[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKOUT_STORE, 'readonly');
    const store = tx.objectStore(WORKOUT_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveWorkouts(workouts: Workout[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKOUT_STORE, 'readwrite');
    const store = tx.objectStore(WORKOUT_STORE);
    store.clear();
    workouts.forEach((w) => store.put(w));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveImage(exerciseId: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    store.put(blob, exerciseId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImage(exerciseId: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const request = store.get(exerciseId);
    request.onsuccess = () => {
      if (request.result) {
        const blob = request.result as Blob;
        const url = URL.createObjectURL(blob);
        resolve(url);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteImage(exerciseId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    store.delete(exerciseId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function resolveImageUrl(image?: string): string | null {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image;
  }
  return null;
}

export function isIdbImageKey(image?: string): boolean {
  return !!image && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('data:');
}

export function useWorkoutDB(initialWorkouts: Workout[]) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        localStorage.removeItem('workouts');
        const stored = await getAllWorkouts();
        if (!cancelled) {
          setWorkouts(stored.length > 0 ? stored : initialWorkouts);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setWorkouts(initialWorkouts);
          setLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    (async () => {
      try {
        if (!cancelled) await saveWorkouts(workouts);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [workouts, loaded]);

  return { workouts, setWorkouts, loaded };
}
