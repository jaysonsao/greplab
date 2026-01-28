import type { Executor, ExecResult } from './types';
import type { FsNode } from '$lib/data/fs';

const tokenize = (input: string): string[] => {
  const tokens: string[] = [];
  const regex = /\"([^\"]*)\"|'([^']*)'|[^\s]+/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[0]);
  }
  return tokens;
};

const normalizePath = (cwd: string, target: string): string => {
  if (target.startsWith('/')) return target;
  if (cwd.endsWith('/')) return cwd + target;
  return `${cwd}/${target}`;
};

const listDir = (fs: FsNode[], dir: string): string[] => {
  const dirPath = dir.endsWith('/') && dir !== '/' ? dir.slice(0, -1) : dir;
  const children = fs
    .filter((node) => node.path !== dirPath)
    .filter((node) => node.path.startsWith(dirPath === '/' ? '/' : dirPath + '/'))
    .map((node) => {
      const remainder = node.path.replace(dirPath === '/' ? '/' : dirPath + '/', '');
      return remainder.split('/')[0];
    });
  return Array.from(new Set(children)).filter(Boolean).sort();
};

const readFile = (fs: FsNode[], path: string): string | undefined => {
  const node = fs.find((n) => n.type === 'file' && n.path === path);
  return node && node.type === 'file' ? node.content : undefined;
};

const collectFiles = (fs: FsNode[], paths: string[], recursive: boolean): string[] => {
  const files: string[] = [];
  for (const p of paths) {
    const node = fs.find((n) => n.path === p);
    if (node?.type === 'file') {
      files.push(node.path);
    } else if (node?.type === 'dir' && recursive) {
      const nested = fs.filter((n) => n.type === 'file' && n.path.startsWith(p === '/' ? '/' : p + '/'));
      files.push(...nested.map((f) => f.path));
    }
  }
  return files;
};

const formatMatch = (file: string, lineNo: number, line: string, showLineNumbers: boolean, prefixFile: boolean) => {
  const parts = [] as string[];
  if (prefixFile) parts.push(file.replace(/^\//, ''));
  if (showLineNumbers) parts.push(`${lineNo}`);
  parts.push(line);
  return parts.join(':');
};

const grep = (fs: FsNode[], args: string[], cwd: string): ExecResult => {
  const flags = args.filter((a) => a.startsWith('-'));
  const rest = args.filter((a) => !a.startsWith('-'));
  if (rest.length < 2) {
    return { stdout: '', stderr: 'grep: missing PATTERN or FILE\n', exitCode: 2 };
  }
  const pattern = rest[0];
  const targets = rest.slice(1).map((p) => normalizePath(cwd, p));
  const recursive = flags.includes('-R') || flags.includes('--recursive');
  const files = collectFiles(fs, targets, recursive);
  if (!files.length) {
    return { stdout: '', stderr: 'grep: no such file or directory\n', exitCode: 2 };
  }

  const ignoreCase = flags.includes('-i');
  const invert = flags.includes('-v');
  const showCounts = flags.includes('-c');
  const listFiles = flags.includes('-l');
  const showLineNumbers = flags.includes('-n');
  const extended = flags.includes('-E');

  const regex = extended
    ? new RegExp(pattern, ignoreCase ? 'i' : '')
    : undefined;

  const matchLine = (line: string): boolean => {
    if (regex) return regex.test(line);
    if (ignoreCase) return line.toLowerCase().includes(pattern.toLowerCase());
    return line.includes(pattern);
  };

  const outputs: string[] = [];
  for (const file of files) {
    const content = readFile(fs, file) ?? '';
    const lines = content.split(/\n/);
    let count = 0;
    lines.forEach((line, idx) => {
      const matched = matchLine(line);
      if (invert ? !matched : matched) {
        count += 1;
        if (!showCounts && !listFiles) {
          outputs.push(formatMatch(file, idx + 1, line, showLineNumbers, files.length > 1));
        }
      }
    });
    if (showCounts) outputs.push(`${count}`);
    if (listFiles && count > 0) outputs.push(file.replace(/^\//, ''));
  }

  return { stdout: outputs.join('\n') + (outputs.length ? '\n' : ''), stderr: '', exitCode: 0 };
};

const handleLs = (fs: FsNode[], cwd: string): ExecResult => {
  const entries = listDir(fs, cwd);
  return { stdout: entries.join('\n') + (entries.length ? '\n' : ''), stderr: '', exitCode: 0 };
};

const handleCat = (fs: FsNode[], args: string[], cwd: string): ExecResult => {
  if (!args.length) return { stdout: '', stderr: 'cat: missing file operand\n', exitCode: 1 };
  const outputs: string[] = [];
  for (const arg of args) {
    const path = normalizePath(cwd, arg);
    const content = readFile(fs, path);
    if (content === undefined) {
      return { stdout: '', stderr: `cat: ${arg}: No such file\n`, exitCode: 1 };
    }
    outputs.push(content.endsWith('\n') ? content : content + '\n');
  }
  return { stdout: outputs.join(''), stderr: '', exitCode: 0 };
};

export class SimulatedExecutor implements Executor {
  constructor(private fs: FsNode[]) {}

  run(command: string, cwd: string): ExecResult {
    const tokens = tokenize(command);
    const [cmd, ...args] = tokens;
    if (!cmd) return { stdout: '', stderr: '', exitCode: 0 };

    switch (cmd) {
      case 'grep':
        return grep(this.fs, args, cwd);
      case 'ls':
        return handleLs(this.fs, cwd);
      case 'cat':
        return handleCat(this.fs, args, cwd);
      default:
        return { stdout: '', stderr: `${cmd}: command not implemented in simulator\n`, exitCode: 127 };
    }
  }
}
