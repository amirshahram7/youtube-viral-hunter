/**
 * ARCANUM CENTRALIZED LOGGING SERVICE (V63.1 - PERSISTENT SINGLETON)
 * -----------------------------------------------------------------
 * Enforces a global singleton to ensure logs are visible across all contexts.
 * Maintains 24-hour retention policy.
 */

export type LogType = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  type: LogType;
  source: 'ai-gateway' | 'round-engine' | 'api' | 'system';
  message: string;
  provider?: string;
  round?: number;
  latency?: number;
  error?: string;
}

// Global persistence for Next.js Singleton Pattern
const GLOBAL_LOG_KEY = Symbol.for('arcanum.logger.buffer');
const globalObject = globalThis as any;

if (!globalObject[GLOBAL_LOG_KEY]) {
  globalObject[GLOBAL_LOG_KEY] = [];
}

const MAX_LOGS = 5000;
const RETENTION_MS = 24 * 60 * 60 * 1000; // 24 Hours

export class LoggerService {
  /**
   * Pushes a new log entry to the buffer with 24h pruning.
   */
  private static add(entry: Omit<LogEntry, 'timestamp'>) {
    const now = new Date();
    const newLog: LogEntry = {
      ...entry,
      timestamp: now.toISOString()
    };

    const buffer: LogEntry[] = globalObject[GLOBAL_LOG_KEY];
    buffer.unshift(newLog);

    // Prune old logs (> 24h) and exceed max cap
    const cutoff = now.getTime() - RETENTION_MS;
    
    globalObject[GLOBAL_LOG_KEY] = buffer
      .filter(log => new Date(log.timestamp).getTime() > cutoff)
      .slice(0, MAX_LOGS);

    // Stdout for server dev console
    const logStr = `[${newLog.source.toUpperCase()}] [${newLog.type.toUpperCase()}] ${newLog.message}`;
    if (newLog.type === 'error') console.error(logStr);
    else if (newLog.type === 'warn') console.warn(logStr);
    else console.log(logStr);
  }

  static info(source: LogEntry['source'], message: string, extra?: Partial<LogEntry>) {
    this.add({ type: 'info', source, message, ...extra });
  }

  static warn(source: LogEntry['source'], message: string, extra?: Partial<LogEntry>) {
    this.add({ type: 'warn', source, message, ...extra });
  }

  static error(source: LogEntry['source'], message: string, extra?: Partial<LogEntry>) {
    this.add({ type: 'error', source, message, ...extra });
  }

  static getLogs(): LogEntry[] {
    return globalObject[GLOBAL_LOG_KEY] || [];
  }

  static clear() {
    globalObject[GLOBAL_LOG_KEY] = [];
  }
}
