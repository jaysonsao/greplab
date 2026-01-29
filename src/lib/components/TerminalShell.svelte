<script lang="ts">
  import type { Executor } from '$lib/executors/types';
  import { createEventDispatcher } from 'svelte';

  export let executor: Executor;
  export let cwd = '/';
  export let resetKey = 0; // changing this prop will clear entries

  const dispatch = createEventDispatcher();

  type Entry = { command: string; stdout: string; stderr: string; exitCode: number };
  let entries: Entry[] = [];
  let command = '';

  $: if (resetKey !== undefined) {
    entries = [];
  }

  const runCommand = async () => {
    const trimmed = command.trim();
    if (!trimmed) return;
    const result = await Promise.resolve(executor.run(trimmed, cwd));
    entries = [...entries, { command: trimmed, stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode }];
    dispatch('executed', { command: trimmed, result });
    command = '';
  };
</script>

<div class="code-card h-full flex flex-col">
  <div class="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-slate-300">
    <span>Simulated Terminal</span>
    <span class="text-slate-500">cwd: {cwd}</span>
  </div>

  <div class="flex-1 overflow-auto px-4 py-3 space-y-3 text-sm font-mono">
    {#if entries.length === 0}
      <p class="text-slate-500">Type a grep command to begin.</p>
    {/if}
    {#each entries as entry}
      <div class="space-y-1">
        <div class="text-accent">$ {entry.command}</div>
        {#if entry.stdout}
          <pre class="text-slate-100 whitespace-pre-wrap leading-snug">{entry.stdout}</pre>
        {/if}
        {#if entry.stderr}
          <pre class="text-rose-300 whitespace-pre-wrap leading-snug">{entry.stderr}</pre>
        {/if}
        <div class="text-xs text-slate-500">exit {entry.exitCode}</div>
      </div>
    {/each}
  </div>

  <form class="border-t border-slate-800 px-4 py-3 flex gap-2" on:submit|preventDefault={runCommand}>
    <span class="text-accent font-mono">$</span>
    <input
      class="flex-1 bg-slate-900/70 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-accent"
      placeholder="grep &quot;ERROR&quot; logs/app.log"
      bind:value={command}
    />
    <button type="submit" class="px-3 py-2 bg-accent text-ink font-semibold rounded">Run</button>
  </form>
</div>
