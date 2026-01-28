<script lang="ts">
  import LessonPanel from '$lib/components/LessonPanel.svelte';
  import TerminalShell from '$lib/components/TerminalShell.svelte';
  import FilePanel from '$lib/components/FilePanel.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { lessons } from '$lib/data/lessons';
  import { trainingFs } from '$lib/data/fs';
  import { SimulatedExecutor } from '$lib/executors/SimulatedExecutor';

  const executor = new SimulatedExecutor(trainingFs);
  let index = 0;
  $: lesson = lessons[index];

  const handleNext = () => {
    if (index + 1 < lessons.length) index += 1;
  };
  const handlePrev = () => {
    if (index > 0) index -= 1;
  };
</script>

<div class="max-w-6xl mx-auto py-10 space-y-6">
  <div class="flex items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-semibold text-white">Grep Lab</h1>
      <p class="text-slate-400 text-sm">Simulated grep tutor, ready to plug into a real sandbox later.</p>
    </div>
    <ProgressBar {index} total={lessons.length} />
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
    <LessonPanel {lesson} {index} total={lessons.length} on:next={handleNext} on:prev={handlePrev} />
    <TerminalShell executor={executor} cwd={lesson.cwd} />
    <FilePanel fs={trainingFs} />
  </div>
</div>
