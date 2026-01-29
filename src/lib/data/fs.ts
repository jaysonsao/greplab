export type FsNode =
  | { type: 'dir'; path: string }
  | { type: 'file'; path: string; content: string };

export const trainingFs: FsNode[] = [
  { type: 'dir', path: '/' },
  { type: 'dir', path: '/logs' },
  {
    type: 'file',
    path: '/logs/app.log',
    content: `2026-01-01 INFO service started\n2026-01-02 ERROR failed to connect\n2026-01-03 ERROR timeout\n2026-01-04 WARN retry scheduled\n`
  },
  {
    type: 'file',
    path: '/logs/auth.log',
    content: `Jan 02 08:14:03 login ok\nJan 02 08:16:55 failed password for root\nJan 02 08:17:03 failed password for root\n`
  },
  { type: 'dir', path: '/src' },
  {
    type: 'file',
    path: '/src/server.js',
    content: `function start() {\n  console.log('Server online');\n}\n// TODO: handle retries\n`
  },
  {
    type: 'file',
    path: '/src/utils/format.ts',
    content: `export const format = (value: string) => value.trim();\nexport const VERSION = '1.0.0';\n`
  },
  { type: 'dir', path: '/data' },
  {
    type: 'file',
    path: '/data/users.csv',
    content: `id,name,email\n1,Ada,ada@example.com\n2,Linus,linus@example.com\n3,Grace,grace@example.com\n`
  },
  { type: 'dir', path: '/notes' },
  {
    type: 'file',
    path: '/notes/todo.txt',
    content: `- add retries\n- document grep lessons\n- ship demo\n`
  },
  { type: 'dir', path: '/texts' },
  {
    type: 'file',
    path: '/texts/animals.txt',
    content: `cat\nconcatenate\nscatter\ncatalog\nDog\ndogmatic\nhotdog\n`
  },
  {
    type: 'file',
    path: '/texts/anchors.txt',
    content: `ERROR boot failed\nWARN low memory\nINFO boot complete\nERROR shutdown pending\n`
  },
  {
    type: 'file',
    path: '/texts/classes.txt',
    content: `abc\n123\n9lives\nzoo\nfile01\n`
  },
  { type: 'dir', path: '/regex' },
  {
    type: 'file',
    path: '/regex/quantifiers.txt',
    content: `a\nab\nabb\nabbb\nabbbb\n`
  },
  {
    type: 'file',
    path: '/regex/groups.txt',
    content: `cat\ndog\ncatalog\nconcatenate\nhotdog\n`
  }
];
