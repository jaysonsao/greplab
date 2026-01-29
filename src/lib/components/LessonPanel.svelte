<script lang="ts">
  import type { Lesson } from '$lib/data/lessons';
  import { createEventDispatcher } from 'svelte';

  export let lesson: Lesson;
  export let index: number;
  export let total: number;
  export let completed = false;

  let showHints = false;

  $: if (lesson?.id) {
    showHints = false;
  }

  const dispatch = createEventDispatcher();
</script>

<div class="code-card p-4 space-y-3 h-full">
  <div class="flex items-center justify-between">
    <div class="text-sm uppercase tracking-wide text-slate-400 flex items-center gap-2">
      <span>Lesson {index + 1} / {total}</span>
      {#if completed}
        <span class="px-2 py-1 rounded-full bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-xs">Completed</span>
      {/if}
    </div>
    <div class="flex gap-2 text-xs text-slate-300">
      {#each lesson.conceptTags as tag}
        <span class="px-2 py-1 rounded-full bg-slate-800 border border-slate-700">{tag}</span>
      {/each}
    </div>
  </div>

  <div>
    <h1 class="text-xl font-semibold text-white">{lesson.title}</h1>
    <p class="text-slate-300 mt-1 leading-relaxed">{lesson.prompt}</p>
  </div>

  {#if lesson.note}
    <div class="text-sm text-slate-200 p-3 rounded bg-slate-800/60 border border-slate-700">
      <span class="font-semibold text-slate-100">Concept:</span> {lesson.note}
    </div>
  {/if}

  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-400">Hints</p>
      <button class="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200" on:click={() => (showHints = true)}>
        Reveal hint
      </button>
    </div>
    {#if showHints}
      <ul class="list-disc list-inside text-slate-200 text-sm space-y-1">
        {#each lesson.hints as hint}
          <li>{hint}</li>
        {/each}
      </ul>
    {:else}
      <p class="text-slate-500 text-xs">Hints are hidden until you click “Reveal”.</p>
    {/if}
  </div>

  <div class="flex gap-2 pt-2">
    <button class="px-3 py-2 bg-slate-800 border border-slate-700 rounded" on:click={() => dispatch('prev')} disabled={index === 0}>
      Previous
    </button>
    <button class="px-3 py-2 bg-accent text-ink font-semibold rounded" on:click={() => dispatch('next')} disabled={index + 1 >= total}>
      Next
    </button>
  </div>
</div>
