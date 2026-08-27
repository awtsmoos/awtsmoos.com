// B"H

export const PROFESSIONAL_WORLD = {
  id: 'professional_2d_lantern_workshop_v1',
  style: 'professional_2d_workshop',
  timeOfDay: .38,
  groundY: 210,
  cameraPolicy: 'face_first_cinematic_mobile_safe',
  detailDensity: 'feature_short_high',
  emotionalContinuity: 'eyes_then_hands_then_body',
  mobileSafe: true,
  visualPromise: 'painted_depth_warm_light_distinct_silhouettes',
  background: {
    skyColorTop: '#79cfff', skyColorBottom: '#ffe1a1', groundColor: '#5faa57',
    rimLight: '#ffd36e', shadow: 'rgba(43,31,22,.28)'
  },
  parallax: [
    { id: 'far_hills', depth: .16, mood: 'soft_blue_hills' },
    { id: 'village_roofs', depth: .34, mood: 'storybook_roofs' },
    { id: 'workshop_arch', depth: .62, mood: 'warm_wood_frame' },
    { id: 'foreground_flowers', depth: 1.08, mood: 'large_soft_foreground' }
  ],
  atmosphere: { dustMotes: true, driftingClouds: true, warmRim: true, sparkleMotifs: true }
};
