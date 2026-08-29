# AGENTS.md

## Project

React + TypeScript + Vite workout manager app. Single-page, no monorepo, no backend.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (typecheck then build)
- `npm run test` — `vitest run` (jsdom environment)

`npm run lint` uses `oxlint` which is not installed — skip lint step.

## Architecture

- `src/App.tsx` — central state, routing between views (list/detail/exercise/crud)
- `src/hooks/useWorkoutDB.ts` — IndexedDB persistence (replaced localStorage)
- `src/types/workout.ts` — `Workout`, `Exercise`, `Series` types
- `src/components/` — `WorkoutList`, `WorkoutDetail`, `ExerciseDetail`, `WorkoutForm`
- Views: `'list' | 'detail' | 'exercise' | 'crud'`

## Data storage

IndexedDB with two object stores: `workouts` and `images`. The `useWorkoutDB` hook clears old `localStorage` key on first load.

Exercise images: stored as `Blob` in IndexedDB (uploaded) or as URL string (external). `ExerciseDetail` loads IDB images via `getImage()` and shows `Dumbbell` icon fallback when no image exists.

## Conventions

- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Icons from `lucide-react`
- No component library — plain Tailwind utility classes
- Mobile-first responsive design with `min-h-[44px]` touch targets
- Data IDs: `Math.random().toString(36).substring(2, 9)`
