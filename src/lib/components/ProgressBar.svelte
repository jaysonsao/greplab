<script lang="ts">
  export let current = 1;
  export let completed = 0;
  export let total = 1;

  const percent = total ? Math.round((current / total) * 100) : 0;
</script>

<div class="w-full">
  <div class="flex justify-between text-xs text-slate-400 mb-1">
    <span>Progress</span>
    <span>{percent}% (lesson {current}/{total}, done {completed})</span>
  </div>
  <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
    <div class="bg-accent h-full transition-all" style={`width: ${percent}%`} />
  </div>
</div>
