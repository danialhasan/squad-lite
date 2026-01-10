import type { Sandbox } from '@e2b/sdk'

// ============================================================
// SANDBOX MANAGER INTERFACE (FROZEN CONTRACT)
// ============================================================

export interface SandboxConfig {
  agentId: string
  agentType: 'director' | 'specialist'
  specialization?: 'researcher' | 'writer' | 'analyst' | 'general'
  timeoutMs?: number
  cpuCount?: number
  memoryMB?: number
}

export interface SandboxInstance {
  sandboxId: string
  agentId: string
  sandbox: Sandbox
  status: 'active' | 'paused' | 'killed'
  createdAt: Date
  lastHeartbeat: Date
}

export interface CommandOptions {
  cwd?: string
  env?: Record<string, string>
  timeoutMs?: number
  onStdout?: (data: string) => void
  onStderr?: (data: string) => void
}

export interface CommandResult {
  exitCode: number
  stdout: string
  stderr: string
  error: boolean
}

export interface SandboxManager {
  /**
   * Create a new E2B sandbox for an agent
   * @param config Sandbox configuration
   * @returns SandboxInstance with E2B sandbox reference
   * @throws SandboxCreationError if creation fails
   */
  create(config: SandboxConfig): Promise<SandboxInstance>

  /**
   * Execute a command in an agent's sandbox
   * @param agentId Agent ID
   * @param command Shell command to execute
   * @param options Execution options with streaming callbacks
   * @returns CommandResult with exit code and output
   * @throws SandboxNotFoundError if sandbox doesn't exist
   * @throws CommandTimeoutError if command exceeds timeout
   * @throws CommandExecutionError if command fails (non-zero exit)
   */
  execute(agentId: string, command: string, options?: CommandOptions): Promise<CommandResult>

  /**
   * Pause a sandbox (hibernation)
   * @param agentId Agent ID
   * @throws SandboxNotFoundError if sandbox doesn't exist
   */
  pause(agentId: string): Promise<void>

  /**
   * Resume a paused sandbox
   * @param agentId Agent ID
   * @throws SandboxNotFoundError if sandbox doesn't exist
   */
  resume(agentId: string): Promise<void>

  /**
   * Kill a sandbox permanently
   * @param agentId Agent ID
   */
  kill(agentId: string): Promise<void>

  /**
   * Get sandbox instance for an agent
   * @param agentId Agent ID
   * @returns SandboxInstance or undefined if not found
   */
  get(agentId: string): SandboxInstance | undefined

  /**
   * List all active sandboxes
   * @returns Array of all SandboxInstances
   */
  list(): SandboxInstance[]

  /**
   * Check if sandbox is running
   * @param agentId Agent ID
   * @returns true if sandbox exists and not killed
   */
  isRunning(agentId: string): boolean
}

// ============================================================
// E2B SDK USAGE PATTERNS (REFERENCE)
// ============================================================

/**
 * Creating sandbox (from E2B SDK docs):
 *
 * const sandbox = await Sandbox.create({
 *   apiKey: config.e2bApiKey,
 *   timeoutMs: 10 * 60 * 1000,  // 10 minutes
 *   metadata: {
 *     agentId: '...',
 *     agentType: 'director',
 *   },
 * })
 */

/**
 * Executing commands with streaming:
 *
 * const result = await sandbox.commands.run('npm install', {
 *   cwd: '/home/user/project',
 *   onStdout: (data) => console.log(data.toString()),
 *   onStderr: (data) => console.error(data.toString()),
 * })
 */

/**
 * Pause sandbox (beta API):
 *
 * await sandbox.betaPause()
 */

/**
 * Resume sandbox (reconnect):
 *
 * const sandbox = await Sandbox.connect(sandboxId, {
 *   apiKey: config.e2bApiKey,
 * })
 */

/**
 * Kill sandbox:
 *
 * await sandbox.kill()
 */

// ============================================================
// ERROR HANDLING CONTRACT
// ============================================================

export class SandboxError extends Error {
  constructor(message: string, public sandboxId?: string) {
    super(message)
    this.name = 'SandboxError'
  }
}

export class SandboxCreationError extends SandboxError {
  constructor(message: string) {
    super(message)
    this.name = 'SandboxCreationError'
  }
}

export class CommandTimeoutError extends SandboxError {
  constructor(sandboxId: string, command: string) {
    super(`Command timed out: ${command}`, sandboxId)
    this.name = 'CommandTimeoutError'
  }
}

export class CommandExecutionError extends SandboxError {
  constructor(sandboxId: string, command: string, public exitCode: number, public stderr: string) {
    super(`Command failed with exit code ${exitCode}: ${command}`, sandboxId)
    this.name = 'CommandExecutionError'
  }
}

export class SandboxNotFoundError extends SandboxError {
  constructor(agentId: string) {
    super(`Sandbox not found for agent: ${agentId}`)
    this.name = 'SandboxNotFoundError'
  }
}

export class SandboxKilledError extends SandboxError {
  constructor(sandboxId: string) {
    super(`Operation on killed sandbox: ${sandboxId}`, sandboxId)
    this.name = 'SandboxKilledError'
  }
}
