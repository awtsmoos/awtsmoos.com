// B"H

/**
 * Performance monitor renderer with class-only status coloring.
 */
export class PerfRenderer {
  /**
   * Renders the performance box.
   *
   * @param {Object} stats - Runtime performance stats.
   * @returns {string} HTML string.
   */
  static render(stats) {
    const tone = stats.fps < 30 ? 'low' : (stats.fps < 50 ? 'warn' : 'good');
    return `
      <div class="perf-box flex-col gap-1">
        <div class="perf-row flex-space-between">
          <span>FPS:</span> <span class="perf-fps perf-fps-${tone}">${stats.fps}</span>
        </div>
        <div class="perf-row flex-space-between">
          <span>MS:</span> <span>${stats.ms}</span>
        </div>
        <div class="perf-row flex-space-between">
          <span>POLYS:</span> <span>~${stats.entities}</span>
        </div>
      </div>
    `;
  }
}
