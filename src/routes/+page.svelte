<script lang="ts">
  import LessonPanel from '$lib/components/LessonPanel.svelte';
  import TerminalShell from '$lib/components/TerminalShell.svelte';
  import FilePanel from '$lib/components/FilePanel.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { lessons, type Lesson } from '$lib/data/lessons';
  import { trainingFs, type FsNode } from '$lib/data/fs';
  import { SimulatedExecutor } from '$lib/executors/SimulatedExecutor';
  import { onMount } from 'svelte';

  const executor = new SimulatedExecutor(trainingFs);
  let index = 0;
  $: lesson = lessons[index];
  let visibleFs: FsNode[] = trainingFs;
  $: visibleFs = lesson.visiblePaths
    ? trainingFs.filter((node) => {
        if (!lesson.visiblePaths) return true;
        if (lesson.visiblePaths.includes(node.path)) return true;
        // keep parent dirs of visible files for context
        return lesson.visiblePaths.some((p) => p.startsWith(node.path + '/'));
      })
    : trainingFs;
  let feedback: { status: 'idle' | 'pass' | 'fail'; message: string } = { status: 'idle', message: '' };
  let completedIds = new Set<string>();
  $: completedCount = completedIds.size;
  let terminalResetKey = 0;

  onMount(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('grepLabCompleted');
      if (saved) {
        completedIds = new Set(JSON.parse(saved));
      }
    }
  });

  const persistCompleted = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('grepLabCompleted', JSON.stringify(Array.from(completedIds)));
    }
  };

  const handleNext = () => {
    if (index + 1 < lessons.length) index += 1;
    feedback = { status: 'idle', message: '' };
    terminalResetKey += 1;
  };
  const handlePrev = () => {
    if (index > 0) index -= 1;
    feedback = { status: 'idle', message: '' };
    terminalResetKey += 1;
  };

  const evaluate = (stdout: string, lessonSuccess: Lesson['success']): boolean => {
    switch (lessonSuccess.type) {
      case 'stdout_exact':
        return stdout === lessonSuccess.expected;
      case 'stdout_contains_all':
        return Array.isArray(lessonSuccess.expected)
          ? lessonSuccess.expected.every((part) => stdout.includes(part))
          : stdout.includes(String(lessonSuccess.expected));
      case 'matches_count_equals':
        return stdout.trim() === String(lessonSuccess.expected);
      default:
        return false;
    }
  };

  const onExecuted = (event: CustomEvent<{ command: string; result: { stdout: string; stderr: string; exitCode: number } }>) => {
    const { command, result } = event.detail;
    const ok = evaluate(result.stdout, lesson.success) && result.exitCode === 0;
    if (ok) {
      feedback = { status: 'pass', message: `Nice! Lesson passed with: ${command}` };
      if (!completedIds.has(lesson.id)) {
        completedIds = new Set(completedIds).add(lesson.id);
        persistCompleted();
      }
    } else {
      feedback = { status: 'fail', message: 'Not quite. Check flags/output and try again.' };
    }
  };
</script>

<div class="max-w-6xl mx-auto py-10 space-y-6">
  <div class="flex items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-semibold text-white">Grep Lab</h1>
      <p class="text-slate-400 text-sm">Simulated grep tutor, ready to plug into a real sandbox later.</p>
    </div>
    <ProgressBar current={index + 1} completed={completedCount} total={lessons.length} />
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
    <LessonPanel {lesson} {index} total={lessons.length} completed={completedIds.has(lesson.id)} on:next={handleNext} on:prev={handlePrev} />
    <div class="space-y-3">
      <TerminalShell executor={executor} cwd={lesson.cwd} resetKey={terminalResetKey} on:executed={onExecuted} />
      {#if feedback.status !== 'idle'}
        <div class={`p-3 rounded border text-sm ${feedback.status === 'pass' ? 'border-emerald-500/60 text-emerald-300 bg-emerald-500/10' : 'border-amber-500/60 text-amber-200 bg-amber-500/10'}`}>
          {feedback.message}
        </div>
      {/if}
    </div>
    <FilePanel fs={visibleFs} />
  </div>
</div>
