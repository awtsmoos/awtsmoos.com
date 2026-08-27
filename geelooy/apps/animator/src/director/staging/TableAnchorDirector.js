// B"H

/** The table is the mizbeach of dialogue: props, hands, and faces orbit it. */
export class TableAnchorDirector {
  static resolve(plan = {}) {
    return {
      enabled: Boolean(plan.enabled),
      tableAnchor: true,
      centerX: 0,
      centerY: 96,
      propY: 84,
      faceCleanZone: true,
      priority: plan.staging?.priority || 'relationship'
    };
  }
}
