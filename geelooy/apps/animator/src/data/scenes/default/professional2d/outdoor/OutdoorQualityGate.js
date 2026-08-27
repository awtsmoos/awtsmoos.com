// B"H

const blockedTerms = [
  'pi' + 'xar',
  'dis' + 'ney',
  'dream' + 'works',
  'ghi' + 'bli',
  'illu' + 'mination'
];

const hasBlockedTerm = text => blockedTerms.some(term => text.toLowerCase().includes(term));

export class OutdoorQualityGate {
  static audit(scene = {}) {
    const json = JSON.stringify(scene);
    const metrics = {
      outdoorWorld: scene.scene?.environment === 'professional_2d_outdoor_plaza',
      compatibleRendererStyle: scene.scene?.style === 'professional_2d_workshop',
      fiveCharacterCast: Object.keys(scene.initialCharacters || {}).length >= 5,
      expressionMaps: json.includes('expressionSet') && json.includes('microAction'),
      distinctSilhouettes: json.includes('silhouetteShape'),
      weatherSystem: Boolean(scene.scene?.weather?.rainIntensity && scene.scene?.weather?.lightningMoments),
      dramaticLightBeats: (scene.scene?.weather?.lightBeats || []).length >= 6,
      parallaxOutdoorDepth: (scene.scene?.parallax || []).length >= 7,
      propDensity: (scene.initialProps || []).length >= 18,
      cinematicCameras: (scene.cameras || []).length >= 10,
      storyEvents: (scene.events || []).length >= 28,
      noBlockedStyleTerms: !hasBlockedTerm(json)
    };
    const missing = Object.entries(metrics).filter(([, v]) => !v).map(([k]) => k);
    return { ok: missing.length === 0, missing, metrics, score: Math.round(Object.values(metrics).filter(Boolean).length / Object.keys(metrics).length * 100) };
  }
}
