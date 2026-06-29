// B"H
import { ProductionRoomBackdrop } from '../../core/renderer/scene/productionRoom/ProductionRoomBackdrop.js';
import { ProfessionalQualityGate } from '../../data/scenes/default/professional2d/index.js';

export class GoalBoardQualityGate {
  static audit(scene = {}) {
    if (scene.scene?.style === 'professional_2d_workshop') return ProfessionalQualityGate.audit(scene);
    const json = JSON.stringify(scene);
    const room = JSON.stringify(ProductionRoomBackdrop.build({ width: 720, height: 1280 }));
    const metrics = this.metrics(scene, json, room);
    const missing = Object.entries(metrics).filter(([, v]) => !v).map(([k]) => k);
    return { ok: missing.length === 0, missing, metrics, score: this.score(metrics) };
  }

  static metrics(scene, json, room) {
    return {
      warmStudy: scene.scene?.style === 'goal_board_warm_study',
      authoredEasy: scene.authoring?.system === 'goalBoardEasyAPI',
      hasTwoScholars: Boolean(scene.initialCharacters?.rabbi_left && scene.initialCharacters?.rabbi_right),
      richProps: (scene.initialProps || []).length >= 10,
      manyShots: (scene.shotFlow || []).length >= 12,
      hasInserts: json.includes('foodInsert') && json.includes('objectInsert'),
      hasEvents: (scene.events || []).length >= 35,
      mobileCoverage: room.includes('warm_wall_deep_coverage'),
      roomRichness: ['production_bookcases', 'production_window', 'production_table', 'production_wall_decor'].every(id => room.includes(id)),
      characterStyle: json.includes('blackHat') && json.includes('beard')
    };
  }

  static score(metrics) {
    const values = Object.values(metrics);
    return Math.round(values.filter(Boolean).length / values.length * 100);
  }
}
