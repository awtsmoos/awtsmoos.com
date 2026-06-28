// B"H
import { OutdoorQualityGate } from './outdoor/OutdoorQualityGate.js';

export class ProfessionalQualityGate {
  static audit(scene = {}) {
    if (scene.scene?.environment === 'professional_2d_outdoor_plaza') {
      return OutdoorQualityGate.audit(scene);
    }
    const json = JSON.stringify(scene);
    const metrics = {
      professionalWorld: scene.scene?.style === 'professional_2d_workshop',
      ensembleCast: Object.keys(scene.initialCharacters || {}).length >= 4,
      distinctSilhouettes: json.includes('silhouetteShape'),
      faceActing: json.includes('expressionProfile') && json.includes('microExpressions'),
      secondaryMotion: json.includes('physics') && json.includes('overlap'),
      richProps: (scene.initialProps || []).length >= 14,
      emotionalObject: json.includes('emotional_object'),
      manyShots: (scene.shotFlow || []).length >= 8,
      cinematicCameras: (scene.cameras || []).some(c => c.renderDetailMode === 'closeup'),
      storyEvents: (scene.events || []).length >= 25,
      parallaxDepth: (scene.scene?.parallax || []).length >= 4,
      atmosphere: Boolean(scene.scene?.atmosphere?.dustMotes && scene.scene?.atmosphere?.warmRim)
    };
    const missing = Object.entries(metrics).filter(([, v]) => !v).map(([k]) => k);
    return { ok: missing.length === 0, missing, metrics, score: Math.round(Object.values(metrics).filter(Boolean).length / Object.keys(metrics).length * 100) };
  }
}
