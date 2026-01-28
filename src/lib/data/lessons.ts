export type Lesson = {
  id: string;
  title: string;
  prompt: string;
  cwd: string;
  allowedCommands: string[];
  conceptTags: string[];
  success: { type: 'stdout_exact' | 'stdout_contains_all' | 'matches_count_equals'; expected: string | string[] | number };
  hints: string[];
  solution: string;
  executionMode: 'simulated' | 'real';
};

export const lessons: Lesson[] = [
  {
    id: 'basic-01',
    title: 'Find a word in a file',
    prompt: 'Search app.log for lines containing ERROR.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['literal', '-n'],
    success: { type: 'stdout_contains_all', expected: ['ERROR'] },
    hints: ['Try: grep "ERROR" logs/app.log'],
    solution: 'grep "ERROR" logs/app.log',
    executionMode: 'simulated'
  },
  {
    id: 'flags-02',
    title: 'Count matches',
    prompt: 'Count how many ERROR lines are in app.log.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-c'],
    success: { type: 'stdout_exact', expected: '2\n' },
    hints: ['Use -c to count matches'],
    solution: 'grep -c "ERROR" logs/app.log',
    executionMode: 'simulated'
  },
  {
    id: 'invert-03',
    title: 'Invert the match',
    prompt: 'Show lines in app.log that are NOT warnings.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-v'],
    success: { type: 'stdout_contains_all', expected: ['ERROR', 'INFO'] },
    hints: ['-v inverts the match'],
    solution: 'grep -v "WARN" logs/app.log',
    executionMode: 'simulated'
  }
];
