// B"H

const psyche = (goal, fear, trust) => ({
  goal, fear, trust, confidence: 0.74, curiosity: 0.68, fatigue: 0.28,
  attention: 'shared_problem', gaze: 'responsive_eye_line', breathing: 'rain_cooled',
  posture: 'balanced_ready', balance: 'mud_adjusted', momentum: 'subtle_weight_shift',
  anticipation: 'prepares_before_speaking', recovery: 'settles_after_interruptions',
  idleActing: 'hands_never_freeze', interruptionBehavior: 'turns_head_then_recovers',
  emotionalTransitions: ['concern', 'focus', 'relief'], conversationalTiming: 'listens_before_reply'
});

const actor = (id, name, role, x, mind, colors) => ({
  id, name, role, archetype: 'outdoor_professional', style: 'weathered_field_workshop',
  position: { x, y: 0, scale: role === 'client' ? 0.9 : 0.95 },
  view: x < 0 ? 'threeQuarterRight' : 'threeQuarterLeft', emotion: 'focused',
  locomotion: 'micro_step_idle', gesture: 'workshop_explain', motionMode: 'continuous',
  bodyProfile: 'procedural_living_actor', expressionProfile: 'layered_face_system',
  gazeMode: 'scene_memory_aware', actingPersonality: role, colors, livingState: mind
});

export const LIVING_CHARACTERS = {
  mentor: actor('mentor', 'Miriam the Field Director', 'mentor', -118,
    psyche('keep the repair readable', 'losing client trust', 0.82),
    { jacket: '#253044', pants: '#1b2430', shirt: '#f3e5c5', skin: '#b77a55', hair: '#2d1b10' }),
  apprentice: actor('apprentice', 'Noam the Apprentice', 'apprentice', 14,
    psyche('prove the method works', 'making the rope slip again', 0.61),
    { jacket: '#6a4b2a', pants: '#252016', shirt: '#efe0bc', skin: '#c68a61', hair: '#22140a' }),
  client: actor('client', 'Ari the Client', 'client', 132,
    psyche('understand the repair before signing', 'being misled by calm words', 0.48),
    { jacket: '#384d3a', pants: '#202820', shirt: '#e4ead2', skin: '#a66a4d', hair: '#17100b' })
};
