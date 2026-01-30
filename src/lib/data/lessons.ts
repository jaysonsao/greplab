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
      'Welcome to GrepLab! This progression walks you through grep (Global Regular Expression Print) basics using a simulated file system. Each lesson tells you a goal, the working directory (cwd), and which commands are allowed. Type commands in the terminal, and check hints if you get stuck. When ready, press Next to start your first search.',
    cwd: '/',
    allowedCommands: ['ls', 'grep', 'cat'],
    conceptTags: ['intro'],
    note: 'explore the files with ls if you like, then hit Next to begin.',
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
    prompt: 'Find lines containing ERROR in app.log.',
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
    prompt: 'Match dog in any case inside texts/animals.txt.',
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
    prompt: 'Search for ERROR across both log files.',
    cwd: '/',
    allowedCommands: ['grep', 'cat', 'ls'],
    conceptTags: ['multiple files'],
    note: 'Grep can take multiple files; shell globs like *.log expand before grep runs.',
    success: { type: 'stdout_contains_all', expected: ['logs/app.log', 'ERROR'] },
    hints: ['Use * as a wildcard to match files with the same extension (e.g., *.log).'],
    solution: 'grep "ERROR" logs/*.log',
    executionMode: 'simulated',
    visiblePaths: ['/', '/logs', '/logs/app.log', '/logs/auth.log']
  },
  {
    id: 'l1-line-numbers',
    title: 'Show line numbers',
    prompt: 'Show line numbers for WARN in logs/app.log.',
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
    prompt: 'Show lines in logs/app.log that are NOT WARN.',
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
    prompt: 'Find three-letter words h.t in animals.txt.',
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
    prompt: 'Find lines that start with ERROR in anchors.txt.',
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
    prompt: 'Match lines that contain a digit in classes.txt.',
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
    prompt: 'Show lines that do NOT contain digits in classes.txt.',
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
    prompt: 'Match a followed by zero or more b in quantifiers.txt.',
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
    prompt: 'Match a followed by one or more b.',
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
    prompt: 'Match exactly three b after a.',
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
    prompt: 'Find cat or dog as separate words.',
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
    prompt: 'Match hotdog or catalog using grouping.',
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
    prompt: 'Match the whole word cat (not catalog).',
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
    prompt: 'Find TODO anywhere under root.',
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
    prompt: 'Count ERROR lines in app.log.',
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
    prompt: 'Extract just the word ERROR from app.log.',
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
    prompt: 'Show 1 line of context after each ERROR.',
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
    prompt: 'Use -F to search literal pattern [0-9].',
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
    prompt: 'Match lines with cat followed by dog later in the line.',
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