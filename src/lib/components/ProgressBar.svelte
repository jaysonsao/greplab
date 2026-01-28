<script lang="ts">
  export let index = 0;
  export let total = 1;

  const percent = Math.round(((index + 1) / total) * 100);
</script>

<div class="w-full">
  <div class="flex justify-between text-xs text-slate-400 mb-1">
    <span>Progress</span>
    <span>{percent}%</span>
  </div>
  <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
    <div class="bg-accent h-full transition-all" style={`width: ${percent}%`} />
  </div>
</div>
