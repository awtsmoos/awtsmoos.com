// B"H

const question = (id, repair) => ({ id, answer: true, repair });

export const DIRECTOR_BRAIN = {
  mode: 'evaluates_every_frame_and_repairs',
  qualityTarget: 100,
  questions: [
    question('story_readable', 'return focus to rope, blueprint, or speaker'),
    question('emotional_focus_obvious', 'push in on active face or reaction'),
    question('faces_visible', 'raise headroom and remove foreground occlusion'),
    question('composition_balanced', 'shift actors across thirds'),
    question('eye_direction_coherent', 'align listener gaze to speaker or prop'),
    question('lighting_supports_emotion', 'increase lantern reflection on face'),
    question('pacing_correct', 'hold breath before repair reveal'),
    question('weather_helps_story', 'make rain reveal wetness risk'),
    question('props_not_distracting', 'dim unrelated tools'),
    question('characters_believable', 'inject gaze, breath, weight shift')
  ],
  repairs: ['composition_repair', 'face_visibility_repair', 'occlusion_repair',
    'continuity_repair', 'weather_emotion_repair', 'dead_frame_repair'],
  score(scene) {
    const questions = this.questions.every(item => item.answer && item.repair);
    const chars = Object.values(scene.initialCharacters || {}).every(c => c.livingState?.idleActing);
    const cameras = (scene.cameras || []).every(c => c.operator === 'virtual_cinematographer');
    return questions && chars && cameras ? 100 : 0;
  }
};
