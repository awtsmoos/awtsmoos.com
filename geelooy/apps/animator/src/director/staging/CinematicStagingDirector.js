// B"H
import { TableAnchorDirector } from './TableAnchorDirector.js';

/**
 * Staging adapter. It does not delete old entity placement; it gives the render
 * pipeline one shared covenant about what matters in the shot.
 */
export class CinematicStagingDirector {
  static resolve(plan = {}) {
    const table = TableAnchorDirector.resolve(plan);
    return {
      ...table,
      worldScaleHint: plan.mobile ? 1.18 : 1,
      emptyFloorLimit: plan.mobile ? 0.18 : 0.24,
      emptyWallLimit: plan.mobile ? 0.22 : 0.3
    };
  }
}
