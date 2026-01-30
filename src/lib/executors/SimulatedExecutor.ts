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
  // Resolve simple relative segments (., ..) against the provided cwd.
  const base = target.startsWith('/') ? target : `${cwd.replace(/\/$/, '')}/${target}`;
  const parts = base.split('/');
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (stack.length) stack.pop();
      continue;
    }
    stack.push(part);
  }

  return '/' + stack.join('/');
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
    // simple glob support: only '*' wildcard
    if (p.includes('*')) {
      const globToRegex = (pattern: string) =>
        new RegExp(
          '^' +
            pattern
              .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&') // escape regex specials except '*'
              .replace(/\*/g, '.*') +
            '$'
        );
      const regex = globToRegex(p);
      const matched = fs.filter((n) => n.type === 'file' && regex.test(n.path));
      files.push(...matched.map((m) => m.path));
      continue;
    }

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
  // Basic flag parsing tailored to the tutor lessons (supports combined short flags).
  const positional: string[] = [];
  let recursive = false;
  let ignoreCase = false;
  let invert = false;
  let showCounts = false;
  let listFiles = false;
  let showLineNumbers = false;
  let extended = false;
  let onlyMatching = false;
  let fixed = false;
  let pcre = false;
  let afterContext = 0;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Context flags can be passed as -A 1 or -A1
    if (arg === '-A' && i + 1 < args.length) {
      afterContext = Number(args[++i]) || 0;
      continue;
    }
    if (/^-A\d+$/.test(arg)) {
      afterContext = Number(arg.slice(2)) || 0;
      continue;
    }

    if (arg === '-F') {
      fixed = true;
      continue;
    }
    if (arg === '-P') {
      pcre = true;
      continue;
    }

    if (arg.startsWith('-') && arg.length > 1) {
      for (let j = 1; j < arg.length; j++) {
        switch (arg[j]) {
          case 'R':
          case 'r':
            recursive = true;
            break;
          case 'i':
            ignoreCase = true;
            break;
          case 'v':
            invert = true;
            break;
          case 'c':
            showCounts = true;
            break;
          case 'l':
            listFiles = true;
            break;
          case 'n':
            showLineNumbers = true;
            break;
          case 'E':
            extended = true;
            break;
          case 'o':
            onlyMatching = true;
            break;
          default:
            break;
        }
      }
      continue;
    }

    positional.push(arg);
  }

  if (positional.length < 2) {
    return { stdout: '', stderr: 'grep: missing PATTERN or FILE\n', exitCode: 2 };
  }

  const pattern = positional[0];
  const targets = positional.slice(1).map((p) => normalizePath(cwd, p));
  const files = collectFiles(fs, targets, recursive);
  if (!files.length) {
    return { stdout: '', stderr: 'grep: no such file or directory\n', exitCode: 2 };
  }

  // Build a matcher. We keep a regex around so -o can return matched segments.
  const buildRegex = (): RegExp => {
    if (pcre || extended) return new RegExp(pattern, (ignoreCase ? 'i' : '') + 'g');
    if (fixed) return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), (ignoreCase ? 'i' : '') + 'g');
    // Default literal search; escape so we don't treat metacharacters specially
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), (ignoreCase ? 'i' : '') + 'g');
  };

  const regex = buildRegex();

  const outputs: string[] = [];
  for (const file of files) {
    const content = readFile(fs, file) ?? '';
    const lines = content.split(/\n/);
    let count = 0;

    lines.forEach((line, idx) => {
      regex.lastIndex = 0; // reset for global regex reuse
      const matches = Array.from(line.matchAll(regex)).map((m) => m[0]).filter(Boolean);
      const isMatch = matches.length > 0;
      const passed = invert ? !isMatch : isMatch;

      if (!passed) return;
      count += 1;

      if (!showCounts && !listFiles) {
        if (onlyMatching && !invert) {
          // Output each match separately
          matches.forEach((m) => outputs.push(formatMatch(file, idx + 1, m, showLineNumbers, files.length > 1)));
        } else {
          outputs.push(formatMatch(file, idx + 1, line, showLineNumbers, files.length > 1));
        }

        if (afterContext > 0) {
          for (let k = 1; k <= afterContext && idx + k < lines.length; k++) {
            outputs.push(formatMatch(file, idx + 1 + k, lines[idx + k], showLineNumbers, files.length > 1));
          }
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
