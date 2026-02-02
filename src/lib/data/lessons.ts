export type Lesson = {
  id: string;
  title: string;
  prompt: string;
  cwd: string;
  allowedCommands: string[];
  conceptTags: string[];
  note?: string;
  success: { type: 'stdout_exact' | 'stdout_contains_all' | 'matches_count_equals'; expected: string | string[] | number };
  hints: string[];
  solution: string;
  executionMode: 'simulated' | 'real';
  visiblePaths?: string[]; // files/dirs to show in the file panel for focus
};

export const lessons: Lesson[] = [
  {
    id: 'l0-welcome',
    title: 'Welcome to GrepLab',
    prompt:
      "This progression walks you through grep (Global Regular Expression Print) basics using a simulated file system. In this environment, you'll search through real files using grep. Type commands in the terminal and check hints if you get stuck.",
    cwd: '/',
    allowedCommands: ['ls', 'grep', 'cat'],
    conceptTags: ['intro'],
    note: 'explore the files with ls if you like, then press Get Started to begin.',
    success: { type: 'stdout_contains_all', expected: [] },
    hints: ['Use ls to peek at the training files.', 'Click Next when you are ready to start.'],
    solution: 'ls',
    executionMode: 'simulated',
    visiblePaths: ['/', '/logs', '/texts', '/regex', '/data', '/notes', '/src']
  },
  // Level 1: Foundations
  {
    id: 'l1-literal',
    title: 'Literal match',
    prompt: 'Open logs/app.log and look at its contents. Your goal is to display only the lines that contain the word ERROR exactly as written. Think about how grep matches plain text by default.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['literal'],
    note: 'Default grep searches for an exact string, case-sensitive.',
    success: { type: 'stdout_contains_all', expected: ['ERROR failed to connect', 'ERROR timeout'] },
    hints: ['Use grep "ERROR" logs/app.log'],
    solution: 'grep "ERROR" logs/app.log',
    executionMode: 'simulated',
    visiblePaths: ['/', '/logs', '/logs/app.log']
  },
  {
    id: 'l1-ignore-case',
    title: 'Case-insensitive',
    prompt: 'Examine animals.txt and notice how the word “dog” appears in different forms. Find a way to search so that capitalization does not matter.',
    cwd: '/texts',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-i'],
    note: '-i makes the match case-insensitive.',
    success: { type: 'stdout_contains_all', expected: ['Dog', 'dogmatic', 'hotdog'] },
    hints: ['Add -i to ignore case.'],
    solution: 'grep -i "dog" animals.txt',
    executionMode: 'simulated',
    visiblePaths: ['/texts', '/texts/animals.txt']
  },
  {
    id: 'l1-multi-file',
    title: 'Multiple files',
    prompt: 'Look inside the logs directory and note how many .log files exist. Search all of them at once for ERROR instead of checking each file manually.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['multiple files'],
    note: "Grep can take multiple files; shell 'globs' like *.log expand before grep runs.",
    success: { type: 'stdout_contains_all', expected: ['logs/app.log', 'ERROR'] },
    hints: ['Use * as a wildcard to match files with the same extension (e.g., *.log).'],
    solution: 'grep "ERROR" logs/*.log',
    executionMode: 'simulated',
    visiblePaths: ['/', '/logs', '/logs/app.log', '/logs/auth.log']
  },
  {
    id: 'l1-line-numbers',
    title: 'Show line numbers',
    prompt: 'Find where WARN appears inside logs/app.log. Modify your search so the output shows which line number each match came from.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-n'],
    note: '-n prefixes each matching line with its line number.',
    success: { type: 'stdout_contains_all', expected: ['4:2026-01-04 WARN retry scheduled'] },
    hints: ['Add -n to show numbers.'],
    solution: 'grep -n "WARN" logs/app.log',
    executionMode: 'simulated',
    visiblePaths: ['/', '/logs', '/logs/app.log']
  },
  {
    id: 'l1-invert',
    title: 'Invert matches',
    prompt: 'View logs/app.log and notice the different log levels. Now display every line except the ones containing WARN.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-v'],
    note: '-v inverts the match, showing lines that do not match the pattern.',
    success: { type: 'stdout_contains_all', expected: ['ERROR failed to connect', 'ERROR timeout', 'INFO service started'] },
    hints: ['Use -v to invert.'],
    solution: 'grep -v "WARN" logs/app.log',
    executionMode: 'simulated',
    visiblePaths: ['/', '/logs', '/logs/app.log']
  },

  // Level 2: Basic regex
  {
    id: 'l2-wildcard',
    title: 'Wildcard dot',
    prompt: 'Look through animals.txt for short words starting with h and ending with t. Write a pattern that allows any single character in between.',
    cwd: '/texts',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '.'],
    note: 'With -E, . matches any single character.',
    success: { type: 'stdout_contains_all', expected: ['hotdog'] },
    hints: ['Use -E "h.t" animals.txt'],
    solution: 'grep -E "h.t" animals.txt',
    executionMode: 'simulated',
    visiblePaths: ['/texts', '/texts/animals.txt']
  },
  {
    id: 'l2-anchors',
    title: 'Anchors ^ and $',
    prompt: 'Some lines in anchors.txt contain ERROR in different positions. Find only the lines where ERROR appears at the very beginning.',
    cwd: '/texts',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '^'],
    note: '^ anchors the match to the start of the line (use $ for end).',
    success: { type: 'stdout_contains_all', expected: ['ERROR boot failed', 'ERROR shutdown pending'] },
    hints: ['Use ^ERROR with -E.'],
    solution: 'grep -E "^ERROR" anchors.txt',
    executionMode: 'simulated',
    visiblePaths: ['/texts', '/texts/anchors.txt']
  },
  {
    id: 'l2-classes',
    title: 'Character classes',
    prompt: 'Open classes.txt and identify which lines contain numbers. Create a pattern that matches any single digit.',
    cwd: '/texts',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '[0-9]'],
    note: 'Character classes like [0-9] match any one character from the set.',
    success: { type: 'stdout_contains_all', expected: ['123', '9lives', 'file01'] },
    hints: ['Use -E "[0-9]" classes.txt'],
    solution: 'grep -E "[0-9]" classes.txt',
    executionMode: 'simulated',
    visiblePaths: ['/texts', '/texts/classes.txt']
  },
  {
    id: 'l2-negated-class',
    title: 'Negated class',
    prompt: 'In classes.txt, some lines contain only letters, while others include digits. Display only the lines that are made up entirely of non-digit characters.',
    cwd: '/texts',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '[^0-9]'],
    note: 'Negated classes [^...] match any character not in the set.',
    success: { type: 'stdout_contains_all', expected: ['abc', 'zoo'] },
    hints: ['Use -E "^[^0-9]+$"'],
    solution: 'grep -E "^[^0-9]+$" classes.txt',
    executionMode: 'simulated',
    visiblePaths: ['/texts', '/texts/classes.txt']
  },

  // Level 3: Quantifiers
  {
    id: 'l3-star',
    title: 'Kleene star',
    prompt: 'Inspect quantifiers.txt and notice how many b characters follow a. Match lines where a is followed by zero or more bs.',
    cwd: '/regex',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '*'],
    note: '* repeats the previous token zero or more times.',
    success: { type: 'stdout_exact', expected: `a\nab\nabb\nabbb\nabbbb\n` },
    hints: ['Use -E "ab*" quantifiers.txt'],
    solution: 'grep -E "ab*" quantifiers.txt',
    executionMode: 'simulated',
    visiblePaths: ['/regex', '/regex/quantifiers.txt']
  },
  {
    id: 'l3-plus-question',
    title: 'Plus and question',
    prompt: 'Using the same file, match only the lines where a is followed by at least one b. Think about how this differs from zero-or-more.',
    cwd: '/regex',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '+', '?'],
    note: '+ means one or more; ? means zero or one (extended regex).',
    success: { type: 'stdout_exact', expected: `ab\nabb\nabbb\nabbbb\n` },
    hints: ['Use -E "ab+" quantifiers.txt'],
    solution: 'grep -E "ab+" quantifiers.txt',
    executionMode: 'simulated',
    visiblePaths: ['/regex', '/regex/quantifiers.txt']
  },
  {
    id: 'l3-exact-n',
    title: 'Exact repetition',
    prompt: 'Find the line where a is followed by exactly three bs. Make sure your pattern matches the whole line, not just part of it.',
    cwd: '/regex',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '{n}'],
    note: '{n} matches exactly n repetitions; anchor with ^$ to require whole-line match.',
    success: { type: 'stdout_exact', expected: `abbb\n` },
    hints: ['Use anchors: -E "^ab{3}$" quantifiers.txt'],
    solution: 'grep -E "^ab{3}$" quantifiers.txt',
    executionMode: 'simulated',
    visiblePaths: ['/regex', '/regex/quantifiers.txt']
  },

  // Level 4: Grouping & alternation
  {
    id: 'l4-alternation',
    title: 'Alternation',
    prompt: 'Search groups.txt for lines that contain either the word cat or the word dog. Use a single pattern instead of running multiple searches.',
    cwd: '/regex',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '|'],
    note: 'Alternation (|) matches one pattern OR another.',
    success: { type: 'stdout_contains_all', expected: ['cat', 'dog'] },
    hints: ['Use -E "cat|dog" groups.txt'],
    solution: 'grep -E "cat|dog" groups.txt',
    executionMode: 'simulated',
    visiblePaths: ['/regex', '/regex/groups.txt']
  },
  {
    id: 'l4-group',
    title: 'Grouping',
    prompt: 'In groups.txt, some words share common parts. Use grouping to build a pattern that matches both hotdog and catalog without writing them separately.',
    cwd: '/regex',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '()'],
    note: 'Parentheses group tokens so quantifiers or alternation apply to the whole group.',
    success: { type: 'stdout_contains_all', expected: ['hotdog', 'catalog'] },
    hints: ['Try -E "cat(alog)?|hotdog" groups.txt'],
    solution: 'grep -E "(hot)?dog|catalog" groups.txt',
    executionMode: 'simulated',
    visiblePaths: ['/regex', '/regex/groups.txt']
  },

  // Level 5: Word boundaries
  {
    id: 'l5-boundary',
    title: 'Word boundaries',
    prompt: 'Search for the word cat in animals.txt. Make sure your result does not include longer words like catalog. Think about how to match whole words only.',
    cwd: '/texts',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-E', '\\b'],
    note: '\\\\b matches word boundaries so you capture whole words only.',
    success: { type: 'stdout_contains_all', expected: ['cat'] },
    hints: ['Use -E "\\\\bcat\\\\b" animals.txt'],
    solution: 'grep -E "\\\\bcat\\\\b" animals.txt',
    executionMode: 'simulated',
    visiblePaths: ['/texts', '/texts/animals.txt']
  },

  // Level 6: Extended features (some need real executor)
  {
    id: 'l6-recursive',
    title: 'Recursive search',
    prompt: 'Explore the directory tree under /. Find every occurrence of TODO, even in files inside subdirectories.',
    cwd: '/',
    allowedCommands: ['grep', 'ls', 'cat'],
    conceptTags: ['-R'],
    note: '-R (or -r) searches directories recursively.',
    success: { type: 'stdout_contains_all', expected: ['src/server.js'] },
    hints: ['Use -R "TODO" .'],
    solution: 'grep -R "TODO" .',
    executionMode: 'simulated'
  },
  {
    id: 'l6-count',
    title: 'Count matches',
    prompt: 'Determine how many lines in logs/app.log contain ERROR. Modify your command so it reports only a number, not the lines themselves.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['-c'],
    note: '-c outputs only the number of matching lines.',
    success: { type: 'stdout_exact', expected: '2\n' },
    hints: ['Use -c with your pattern.'],
    solution: 'grep -c "ERROR" logs/app.log',
    executionMode: 'simulated'
  },
  {
    id: 'l6-only-matching',
    title: 'Only matching part (-o)',
    prompt: 'Normally, grep prints entire matching lines. Change your search so it outputs only the matched word ERROR.',
    cwd: '/',
    allowedCommands: ['grep'],
    conceptTags: ['-o'],
    note: '-o prints only the matched text instead of the whole line.',
    success: { type: 'stdout_contains_all', expected: ['ERROR'] },
    hints: ['Use -o "ERROR" logs/app.log'],
    solution: 'grep -o "ERROR" logs/app.log',
    executionMode: 'real' // simulator doesn\'t implement -o yet
  },

  // Level 7+ advanced (future real executor)
  {
    id: 'l7-context',
    title: 'Context lines',
    prompt: 'When an error occurs, the following line often contains useful information. Show each ERROR line along with the line immediately after it.',
    cwd: '/',
    allowedCommands: ['grep'],
    conceptTags: ['-A'],
    note: '-A prints N lines after each match; -B before, -C both.',
    success: { type: 'stdout_contains_all', expected: ['ERROR'] },
    hints: ['Use -A 1 "ERROR" logs/app.log'],
    solution: 'grep -A1 "ERROR" logs/app.log',
    executionMode: 'real'
  },
  {
    id: 'l7-fixed',
    title: 'Fixed string mode',
    prompt: 'Search for the text [0-9] exactly as written in classes.txt. Prevent grep from treating it as a regular expression.',
    cwd: '/texts',
    allowedCommands: ['grep'],
    conceptTags: ['-F'],
    note: '-F treats the pattern as a fixed string (faster, no regex).',
    success: { type: 'stdout_contains_all', expected: ['[0-9]'] },
    hints: ['Use -F "[0-9]" classes.txt'],
    solution: 'grep -F "[0-9]" classes.txt',
    executionMode: 'real'
  },
  {
    id: 'l7-pcre-lookahead',
    title: 'Lookahead (PCRE)',
    prompt: 'In groups.txt, find lines where cat appears before dog on the same line. Match the line without consuming the dog part of the text.',
    cwd: '/regex',
    allowedCommands: ['grep'],
    conceptTags: ['-P', 'lookahead'],
    note: '-P enables PCRE; lookahead (?=...) asserts following text without consuming it.',
    success: { type: 'stdout_contains_all', expected: ['concatenate'] },
    hints: ['Use -P "cat(?=.*dog)" groups.txt'],
    solution: 'grep -P "cat(?=.*dog)" groups.txt',
    executionMode: 'real'
  }
];