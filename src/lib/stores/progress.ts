import { writable } from 'svelte/store';

export const currentLessonIndex = writable(0);

export const completedLessons = writable<Set<string>>(new Set());
