import { logger } from '@/lib/logger'

/**
 * Threshold in milliseconds for considering a query slow
 */
const SLOW_QUERY_THRESHOLD = 500

/**
 * Sample rate for slow query logs (0.2 = log 20% of slow queries)
 * This reduces noise while still capturing problematic patterns
 */
const SLOW_QUERY_SAMPLE_RATE = 0.2

/**
 * Setup slow-query monitoring for a Prisma client
 * Logs queries that exceed SLOW_QUERY_THRESHOLD
 */
export function setupPrismaQueryMonitor(client: any): void {
  if (!client || typeof client.$on !== 'function') {
    return
  }

  // Listen for query events
  client.$on('query', (event: any) => {
    const { query, duration, params } = event
    
    if (duration > SLOW_QUERY_THRESHOLD) {
      // Apply sampling to reduce noise
      if (Math.random() < SLOW_QUERY_SAMPLE_RATE) {
        // Truncate long queries for logging
        const truncatedQuery = query.length > 500 
          ? query.substring(0, 500) + '...'
          : query
        
        logger.info('Slow Prisma query detected', {
          duration: `${duration}ms`,
          threshold: `${SLOW_QUERY_THRESHOLD}ms`,
          query: truncatedQuery,
          paramCount: params ? params.length : 0,
          sampleRate: SLOW_QUERY_SAMPLE_RATE,
        })
      }
    }
  })

  // Listen for query errors
  client.$on('error', (event: any) => {
    const { message } = event
    logger.error('Prisma query error', {
      message,
      timestamp: new Date().toISOString(),
    })
  })

  if (process.env.NODE_ENV === 'development') {
    logger.debug('Prisma query monitoring enabled', {
      slowQueryThreshold: `${SLOW_QUERY_THRESHOLD}ms`,
      sampleRate: SLOW_QUERY_SAMPLE_RATE,
    })
  }
}

/**
 * Query stats aggregator for tracking per-operation metrics
 */
export class QueryStatsCollector {
  private stats: Map<string, { count: number; totalDuration: number; maxDuration: number }> = new Map()

  recordQuery(operation: string, duration: number): void {
    if (!this.stats.has(operation)) {
      this.stats.set(operation, { count: 0, totalDuration: 0, maxDuration: 0 })
    }

    const stat = this.stats.get(operation)!
    stat.count += 1
    stat.totalDuration += duration
    stat.maxDuration = Math.max(stat.maxDuration, duration)

    if (duration > SLOW_QUERY_THRESHOLD && Math.random() < SLOW_QUERY_SAMPLE_RATE) {
      logger.warn('Slow operation detected', {
        operation,
        duration: `${duration}ms`,
        avgDuration: `${Math.round(stat.totalDuration / stat.count)}ms`,
        callCount: stat.count,
      })
    }
  }

  getStats(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const result: Record<string, any> = {}
    for (const [key, value] of this.stats.entries()) {
      result[key] = {
        count: value.count,
        avgDuration: Math.round(value.totalDuration / value.count),
        maxDuration: value.maxDuration,
      }
    }
    return result
  }

  reset(): void {
    this.stats.clear()
  }
}

/**
 * Global query stats instance
 */
export const queryStats = new QueryStatsCollector()
