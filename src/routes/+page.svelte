<script lang="ts">
  import LessonPanel from '$lib/components/LessonPanel.svelte';
  import TerminalShell from '$lib/components/TerminalShell.svelte';
  import FilePanel from '$lib/components/FilePanel.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { lessons, type Lesson } from '$lib/data/lessons';
  import { trainingFs, type FsNode } from '$lib/data/fs';
  import { SimulatedExecutor } from '$lib/executors/SimulatedExecutor';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

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
  let started = false;
  let notebookOpen = false;
  let hoverFlag: string | null = null;

  // Collect unique flags from all lessons up to (and including) the current one.
  $: learnedFlags = Array.from(
    new Set(
      lessons
        .slice(0, index + 1)
        .flatMap((l) => l.conceptTags)
    )
  ).sort();

  const flagDescriptions: Record<string, string> = {
    intro: 'Orientation lesson; no command required—just read and continue.',
    literal: 'Treat the pattern as plain text. No regex magic—grep looks for the exact characters you type.',
    '-i': 'Ignore case when matching. "Dog", "dog", and "DOG" all count.',
    '-R': 'Search directories recursively. Walks subfolders under the given path.',
    '-r': 'Lowercase variant of -R; also performs a recursive search through subdirectories.',
    '-n': 'Show line numbers before each matching line to help locate them in files.',
    '-v': 'Invert the match: show lines that do NOT match the pattern.',
    '-c': 'Print only the count of matching lines per file instead of the lines themselves.',
    '-l': 'List only filenames that contain at least one match; suppress matching lines.',
    '-o': 'Output only the matched text itself, not the whole line (may produce multiple outputs per line).',
    '-A': 'After-context: show N lines that follow each match to provide surrounding context.',
    '-F': 'Fixed-string search. Disables regex—treats pattern literally and is faster for plain text.',
    '-P': 'Enable PCRE (Perl-compatible regex) for advanced features like lookarounds.',
    '-E': 'Use extended regex syntax so operators like +, ?, |, () work without escaping.',
    '.': 'Dot wildcard: matches exactly one of any character except newline.',
    '^': 'Start-anchor: pattern must appear at the beginning of the line.',
    '$': 'End-anchor: pattern must appear at the end of the line.',
    '[0-9]': 'Character class: matches any single digit 0–9.',
    '[^0-9]': 'Negated class: matches any single character that is NOT a digit.',
    '*': 'Kleene star: repeats the previous token zero or more times.',
    '+': 'One-or-more quantifier: repeats the previous token one or more times.',
    '?': 'Optional quantifier: previous token may appear zero or one time.',
    '{n}': 'Exact repetition: previous token must repeat exactly n times.',
    '|': 'Alternation operator: match the pattern on the left OR the pattern on the right.',
    '()': 'Grouping: treat enclosed tokens as a single unit for alternation or quantifiers.',
    '\\b': 'Word boundary anchor: matches positions between word and non-word characters, useful for whole words.',
    'lookahead': 'Lookahead assertion (?=...): require following text without consuming it.',
    'multiple files': 'Pass multiple files (or globs like *.log) so grep scans each of them.',
    '() alternation': 'Grouping with alternation—combine () with | to form larger OR expressions.'
  };

  const describeFlag = (flag: string) => flagDescriptions[flag] ?? 'Quick ref not added yet';
  $: hoverDescription = hoverFlag ? describeFlag(hoverFlag) : '';

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

<div class="min-h-screen relative overflow-hidden bg-slate-950">
  {#if !started}
    <div class="fixed inset-0 z-20 flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100"
      transition:fade>
      <h1 class="text-5xl sm:text-6xl font-bold tracking-tight mb-6">GrepLab</h1>
      <button
        class="px-6 py-3 text-lg font-semibold rounded-md bg-accent text-ink shadow-lg shadow-accent/30 hover:translate-y-[-1px] transition-transform"
        on:click={() => (started = true)}>
        Begin
      </button>
    </div>
  {/if}

  <div
    class={`fixed bottom-4 left-4 z-10 transition-all duration-300 ${
      notebookOpen ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-80'
    }`}
  >
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-2 text-xs font-semibold rounded bg-slate-900/80 border border-slate-700 text-slate-100 shadow-lg shadow-black/40 hover:bg-slate-800"
        on:click={() => (notebookOpen = !notebookOpen)}
      >
        {notebookOpen ? 'Close notebook' : 'Notebook'}
      </button>
    </div>

    {#if notebookOpen}
      <div class="mt-2 w-56 max-h-72 overflow-visible bg-slate-900/90 border border-slate-800 rounded-md shadow-2xl shadow-black/50 backdrop-blur-sm p-3 space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Flags learned</span>
          <span class="text-slate-500">up to lesson {index + 1}</span>
        </div>
        {#if learnedFlags.length === 0}
          <p class="text-slate-500 text-xs">Start lessons to fill this notebook.</p>
        {:else}
          <div class="relative">
            <div class="flex flex-wrap gap-1">
              {#each learnedFlags as flag}
                <span
                  class="px-2 py-1 rounded-sm bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                  title={describeFlag(flag)}
                  aria-label={describeFlag(flag)}
                  on:mouseenter={() => (hoverFlag = flag)}
                  on:mouseleave={() => (hoverFlag = null)}
                  on:focus={() => (hoverFlag = flag)}
                  on:blur={() => (hoverFlag = null)}
                  >
                  {flag}
                </span>
              {/each}
            </div>
            {#if hoverDescription}
              <div class="absolute left-full top-0 ml-3 w-44 text-xs text-slate-200 bg-slate-800/90 border border-slate-700 rounded-sm px-2 py-1 shadow-lg shadow-black/50">
                {hoverDescription}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="max-w-6xl mx-auto py-10 space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-white">Grep Lab</h1>
        <p class="text-slate-400 text-sm">Simulated grep tutor, ready to plug into a real sandbox later.</p>
      </div>
      <div class="flex-1 max-w-xl">
        <ProgressBar current={index + 1} completed={completedCount} total={lessons.length} />
        <div class="flex gap-2 mt-2">
          <button class="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm" on:click={handlePrev} disabled={index === 0}>
            Previous
          </button>
          <button class="px-3 py-2 bg-accent text-ink font-semibold rounded-md text-sm" on:click={handleNext} disabled={index + 1 >= lessons.length}>
            Next
          </button>
        </div>
      </div>
    </div>

    {#if lesson.id === 'l0-welcome'}
      <div class="h-[70vh] flex items-center justify-center">
        <div class="code-card max-w-3xl w-full text-center space-y-4 p-8">
          <h2 class="text-3xl font-bold text-white">{lesson.title}</h2>
          <p class="text-slate-300 leading-relaxed">{lesson.prompt}</p>
          {#if lesson.note}
            <div class="text-sm text-slate-200 p-3 rounded-md bg-slate-800/60 border border-slate-700">
              {lesson.note}
            </div>
          {/if}
          <button
            class="px-6 py-3 text-lg font-semibold rounded-md bg-accent text-ink shadow-lg shadow-accent/30 hover:translate-y-[-1px] transition-transform"
            on:click={handleNext}
          >
            Get started
          </button>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
        <LessonPanel {lesson} {index} total={lessons.length} completed={completedIds.has(lesson.id)} on:next={handleNext} on:prev={handlePrev} />
        <div class="space-y-3">
          <TerminalShell executor={executor} cwd={lesson.cwd} resetKey={terminalResetKey} on:executed={onExecuted} />
          {#if feedback.status !== 'idle'}
            <div class={`p-3 rounded-md border text-sm ${feedback.status === 'pass' ? 'border-emerald-500/60 text-emerald-300 bg-emerald-500/10' : 'border-amber-500/60 text-amber-200 bg-amber-500/10'}`}>
              {feedback.message}
            </div>
          {/if}
        </div>
        <FilePanel fs={visibleFs} />
      </div>
    {/if}
  </div>
</div>
