// B"H

/**
 * @file RenderQueueEngine.js
 * @description
 * Creates a render queue for a 20-minute episode: draft animatic, dialogue pass,
 * fur/detail pass, preview, and final assembly.
 */
export class RenderQueueEngine {
  static build(plan) {
    return [
      this.job('draft_animatic', plan, 'Draft every block with timing and camera.'),
      this.job('dialogue_lipsync', plan, 'Generate mouth shapes and reaction beats.'),
      this.job('fur_detail_pass', plan, 'Apply fur cards, hair jitter, cloth folds, and silhouette polish.'),
      this.job('preview_720p', plan, 'Assemble preview render with foley placeholders.'),
      this.job('final_1080p', plan, 'Render final continuous episode output.')
    ];
  }

  static job(id, plan, description) {
    return { id, description, status: 'queued', runtimeMs: plan.runtimeMs, blocks: plan.shots.length };
  }
}
