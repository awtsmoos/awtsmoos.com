// B"H
import { GoalBoardScenePreset } from './GoalBoardScenePreset.js';
import { GoalBoardPreviewManifest } from './GoalBoardPreviewManifest.js';
import { GoalBoardQualityGate } from './GoalBoardQualityGate.js';
import { ProfessionalDefaultScene } from '../../data/scenes/default/professional2d/index.js';

export class GoalBoardEasyAPI {
  static scene(options = {}) { return GoalBoardScenePreset.build(options); }
  static professionalScene(options = {}) { return ProfessionalDefaultScene.build(options); }
  static manifest(options = {}) { return GoalBoardPreviewManifest.create(this.scene(options)); }
  static audit(options = {}) { return GoalBoardQualityGate.audit(this.scene(options)); }
  static professionalAudit(options = {}) { return GoalBoardQualityGate.audit(this.professionalScene(options)); }
  static assert(options = {}) {
    const audit = this.audit(options);
    if (!audit.ok) throw new Error(`B"H scene quality failed: ${audit.missing.join(', ')}`);
    return audit;
  }
}
