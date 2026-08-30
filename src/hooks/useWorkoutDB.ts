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

async function getAllImages(): Promise<Record<string, string>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const request = store.getAll();
    const keyRequest = store.getAllKeys();
    request.onsuccess = () => {
      keyRequest.onsuccess = () => {
        const blobs = request.result;
        const keys = keyRequest.result;
        const images: Record<string, string> = {};
        const promises = keys.map((key, i) => {
          return new Promise<void>((res) => {
            const blob = blobs[i];
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                images[key as string] = reader.result as string;
                res();
              };
              reader.readAsDataURL(blob);
            } else {
              res();
            }
          });
        });
        Promise.all(promises).then(() => resolve(images));
      };
    };
    request.onerror = () => reject(request.error);
    keyRequest.onerror = () => reject(keyRequest.error);
  });
}

export async function saveImages(images: Record<string, string>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    store.clear();
    for (const [key, dataUrl] of Object.entries(images)) {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const b64 = arr[1];
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      store.put(blob, key);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

interface ExportData {
  version: 1;
  workouts: Workout[];
  images: Record<string, string>;
}

export async function exportWorkoutsAsJson(workouts: Workout[]): Promise<void> {
  const images = await getAllImages();
  const exportData: ExportData = { version: 1, workouts, images };
  const data = JSON.stringify(exportData);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `treinos-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importWorkoutsFromJson(file: File): Promise<{ workouts: Workout[]; images: Record<string, string> }> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (Array.isArray(data)) {
    return { workouts: data as Workout[], images: {} };
  }
  if (data && Array.isArray(data.workouts)) {
    return { workouts: data.workouts as Workout[], images: data.images || {} };
  }
  throw new Error('Arquivo inválido.');
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
