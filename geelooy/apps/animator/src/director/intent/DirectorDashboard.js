// B"H
export class DirectorDashboard {
  static build(scene = {}, plan = {}) {
    const shots = scene.cameras || [], events = scene.events || [];
    return {
      sceneId: scene.id, arcPoints: plan.storyArc?.length || 0, lightingBeats: plan.lighting?.length || 0,
      eyeTracks: Object.keys(plan.eyeContact || {}).length, relationshipCount: Object.keys(plan.relationships || {}).length,
      wideShots: shots.filter(s => String(s.type).includes('wide') || String(s.type).includes('establishing')).length,
      closeShots: shots.filter(s => String(s.renderDetailMode).includes('closeup')).length,
      dialogueEvents: events.filter(e => e.type === 'speech').length,
      propEvents: events.filter(e => e.prop).length,
      health: 'directed_scene_ready'
    };
  }
}
