
// B"H
import { PerformanceMonitor } from '../../../perf/PerformanceMonitor.js';

/**
 * @file PerformancePhase.js
 * @brief THE SCALES OF MEASUREMENT (Moznei HaMida).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 7: THE TRACKING OF TIME
 * ═══════════════════════════════════════════════════════════════
 * Logs the completion of a full creation cycle, allowing the FPS 
 * monitor to calculate the exact millisecond strain on the CPU.
 * 
 * @class PerformancePhase
 */
export class PerformancePhase {
  /**
   * @function record
   * @description Pings the monitor with the current timestamp.
   * @param {number} realTime - The absolute clock.
   */
  static record(realTime) {
    PerformanceMonitor.recordFrame(realTime);
  }
}
