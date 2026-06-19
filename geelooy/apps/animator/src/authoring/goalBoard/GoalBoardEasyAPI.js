// B"H
import { GoalBoardScenePreset } from './GoalBoardScenePreset.js';
import { GoalBoardPreviewManifest } from './GoalBoardPreviewManifest.js';
import { GoalBoardQualityGate } from './GoalBoardQualityGate.js';

export class GoalBoardEasyAPI {
  static scene(options = {}) { return GoalBoardScenePreset.build(options); }
  static manifest(options = {}) { return GoalBoardPreviewManifest.create(this.scene(options)); }
  static audit(options = {}) { return GoalBoardQualityGate.audit(this.scene(options)); }
  static assert(options = {}) {
    const audit = this.audit(options);
    if (!audit.ok) throw new Error(`B"H GoalBoard quality failed: ${audit.missing.join(', ')}`);
    return audit;
  }
}
