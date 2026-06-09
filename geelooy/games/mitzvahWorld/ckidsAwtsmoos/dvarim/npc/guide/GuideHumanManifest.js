// B"H
/**
 * @file GuideHumanManifest.js
 * @description Chapter 429: The level guide receives a procedural-core art
 * manifest: rigged human, living eyes, yarmulke, beard, robe, and idle breath.
 */
export const GUIDE_HUMAN_MANIFEST = Object.freeze({
  id: 'central_level_guide_human',
  library: 'geelooy/libs/awtsmoos-procedural-core',
  human: { generator: 'createRiggedHuman', source: 'src/core/components/human/humanGenerator.js' },
  eyes: { generator: 'createLivingEye', source: 'src/core/components/eye/livingEye.js', irisColor: [0.22, 0.44, 0.18] },
  yarmulke: { generator: 'createYarmulke', source: 'src/core/components/clothing/yarmulke.js', color: '#0b0b0b' },
  beard: { source: 'src/core/components/human/hairBuilder.js', colorBase: [0.28, 0.15, 0.07], colorTip: [0.58, 0.42, 0.26] },
  clothing: { robe: '#f4efe0', vest: '#2f5f9f', belt: '#6d4424' },
  pose: { idle: 'gentle_breath_and_hand_open', talk: 'guide_points_to_levels' }
});
