export type ExecResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  meta?: Record<string, unknown>;
};

export interface Executor {
  run(command: string, cwd: string): ExecResult;
}
