<script lang="ts">
  import type { FsNode } from '$lib/data/fs';

  export let fs: FsNode[] = [];

  const files = fs.filter((n) => n.type === 'file');
  let selected = files[0];
</script>

<div class="code-card h-full flex flex-col">
  <div class="border-b border-slate-800 px-4 py-3 text-sm text-slate-300 flex justify-between">
    <span>Training Files</span>
    <span class="text-slate-500">read-only</span>
  </div>
  <div class="flex flex-1 overflow-hidden">
    <div class="w-48 border-r border-slate-800 overflow-auto text-sm">
      {#each files as file}
        <button
          class={`w-full text-left px-3 py-2 border-b border-slate-800 hover:bg-slate-800 ${selected === file ? 'bg-slate-800 text-accent' : 'text-slate-200'}`}
          on:click={() => (selected = file)}
        >
          {file.path.replace(/^\//, '')}
        </button>
      {/each}
    </div>
    <div class="flex-1 overflow-auto p-4">
      {#if selected?.type === 'file'}
        <pre class="text-sm whitespace-pre-wrap text-slate-100 leading-snug">{selected.content}</pre>
      {/if}
    </div>
  </div>
</div>
