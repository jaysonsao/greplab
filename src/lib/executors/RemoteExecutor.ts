import type { Executor, ExecResult } from './types';

// Placeholder for future container-backed execution
export class RemoteExecutor implements Executor {
  async run(command: string, cwd: string): Promise<ExecResult> {
    // In Option B, POST to an API endpoint with {command, cwd} and stream back stdout/stderr
    return {
      stdout: '',
      stderr: 'Remote executor not wired yet. Using simulator.',
      exitCode: 126
    };
  }
}
