// B"H
export class ScenePlanToBeats {
  static convert(plan = {}) { return Array.isArray(plan.beats) ? plan.beats : []; }
}
