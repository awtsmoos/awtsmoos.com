// B"H
export class ScenePlanValidator {
  static validate(plan = {}) { return { ok: Boolean(plan.environment && plan.durationMs), errors: [] }; }
}
