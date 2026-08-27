// B"H

const operatorPlan = (id, at, focus, zoom) => ({
  id, at, focus, zoom, operator: 'virtual_cinematographer',
  automaticReframing: true, silhouettePreservation: true, eyeLinePreservation: true,
  leadingRoom: 'live_from_gaze', headRoom: 'hat_and_rain_safe', dynamicZoom: 'emotion_weighted',
  handheldDrift: 'subtle_rain_breath', stabilization: 'repair_after_gust',
  foregroundFraming: ['grass', 'rope', 'lantern_edge'], occlusionAvoidance: true,
  compositionRepair: ['face_visibility', 'primary_focus', 'balanced_weather_depth']
});

export const VIRTUAL_CINEMATOGRAPHER = {
  mode: 'continuous_operator_every_frame',
  plans: [
    operatorPlan('rain_establish', 0, 'whole workshop geometry', 0.82),
    operatorPlan('mentor_client_two', 1800, 'trust negotiation', 1.05),
    operatorPlan('rope_insert', 3900, 'swinging rope hazard', 1.42),
    operatorPlan('apprentice_reaction', 5600, 'fear becoming competence', 1.28),
    operatorPlan('puddle_reflection', 7400, 'faces reflected in wet ground', 1.35),
    operatorPlan('crowd_flow_wide', 9400, 'extras moving around puddles', 0.92),
    operatorPlan('lantern_close', 11600, 'warm light against rain', 1.48),
    operatorPlan('final_repair_wide', 14600, 'living place after decision', 0.86)
  ]
};
