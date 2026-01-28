<script lang="ts">
  import type { Lesson } from '$lib/data/lessons';
  import { createEventDispatcher } from 'svelte';

  export let lesson: Lesson;
  export let index: number;
  export let total: number;

  const dispatch = createEventDispatcher();
</script>

<div class="code-card p-4 space-y-3 h-full">
  <div class="flex items-center justify-between">
    <div class="text-sm uppercase tracking-wide text-slate-400">Lesson {index + 1} / {total}</div>
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

  <div class="space-y-2">
    <p class="text-sm text-slate-400">Hints</p>
    <ul class="list-disc list-inside text-slate-200 text-sm space-y-1">
      {#each lesson.hints as hint}
        <li>{hint}</li>
      {/each}
    </ul>
  </div>

  <div class="text-sm text-slate-400">
    Solution: <code class="text-slate-200">{lesson.solution}</code>
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
