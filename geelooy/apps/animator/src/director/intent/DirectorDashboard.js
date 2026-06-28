// B"H
export class DirectorDashboard {
  static build(scene = {}, plan = {}) {
    const shots = scene.cameras || [], events = scene.events || [], silences = plan.silenceBeats || [];
    const dialogue = events.filter(e => e.type === 'speech').length;
    return {
      sceneId: scene.id, arcPoints: plan.storyArc?.length || 0, lightingBeats: plan.lighting?.length || 0,
      eyeTracks: Object.keys(plan.eyeContact || {}).length, relationshipCount: Object.keys(plan.relationships || {}).length,
      propStateTracks: Object.keys(plan.propStates || {}).length, environmentalMemoryMarks: plan.environmentalMemory?.length || 0,
      silenceBeats: silences.length, dialogueEvents: dialogue, silenceToDialogue: dialogue ? Number((silences.length / dialogue).toFixed(2)) : 0,
      wideShots: shots.filter(s => String(s.type).includes('wide') || String(s.type).includes('establishing')).length,
      closeShots: shots.filter(s => String(s.renderDetailMode).includes('closeup')).length,
      propEvents: events.filter(e => e.prop).length, health: 'directed_scene_ready'
    };
  }
}
