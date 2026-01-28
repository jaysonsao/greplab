import { writable } from 'svelte/store';

export type TerminalEntry = {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
};

export const history = writable<TerminalEntry[]>([]);
