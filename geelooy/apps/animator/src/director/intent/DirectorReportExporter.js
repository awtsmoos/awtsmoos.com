// B"H
export class DirectorReportExporter {
  static export(scene = {}, plan = {}) {
    return {
      title: scene.name,
      sceneId: scene.id,
      dashboard: plan.dashboard,
      intent: plan.intentScore,
      continuity: plan.continuity,
      cameraPsychology: plan.cameraPsychology,
      arc: (plan.storyArc || []).map(mark => `${mark.emotion}@${mark.at}:${mark.reason}`),
      warnings: this.warnings(plan)
    };
  }
  static warnings(plan = {}) {
    const warnings = [];
    if (plan.continuity?.ok !== true) warnings.push('continuity_not_clean');
    if (plan.intentScore?.score < 100) warnings.push('intent_score_below_100');
    if (plan.cameraPsychology?.ok !== true) warnings.push('camera_psychology_issue');
    return warnings;
  }
}
