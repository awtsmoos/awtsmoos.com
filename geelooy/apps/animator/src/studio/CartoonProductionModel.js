// B"H
import { AnimationPassEngine } from './AnimationPassEngine.js';
import { AnimatorMovieExportEngine } from './export/AnimatorMovieExportEngine.js';
import { AssetManifestEngine } from './AssetManifestEngine.js';
import { ContinuityEngine } from './ContinuityEngine.js';
import { DialogueAudioEngine } from './DialogueAudioEngine.js';
import { EpisodeDurationEngine } from './EpisodeDurationEngine.js';
import { RenderQueueEngine } from './RenderQueueEngine.js';
import { ScreenplayEngine } from './ScreenplayEngine.js';
import { ShotExpansionEngine } from './ShotExpansionEngine.js';

/**
 * @file CartoonProductionModel.js
 * @description
 * One premise becomes a twenty-minute cartoon production plus a one-minute
 * concrete movie export plan plugged in from the piano video-render covenant.
 */
export class CartoonProductionModel {
  static create(premise = '') {
    const clean = (premise || 'An original family gets trapped inside a malfunctioning animation editor.').trim();
    const episode = EpisodeDurationEngine.expand(clean);
    const base = this.base(clean, episode);
    const screenplay = ScreenplayEngine.compile(base);
    const beats = ShotExpansionEngine.expand(base.shots);
    const enriched = { ...base, screenplay, beats };
    const production = {
      ...enriched,
      assetsManifest: AssetManifestEngine.build(enriched),
      continuityLedger: ContinuityEngine.build(enriched),
      audio: DialogueAudioEngine.build(enriched),
      animationPasses: AnimationPassEngine.build(enriched),
      renderQueue: RenderQueueEngine.build(enriched)
    };
    return { ...production, movieExport: AnimatorMovieExportEngine.oneMinutePlan(production) };
  }

  static base(clean, episode) {
    return { title: this.title(clean), premise: clean, style: this.style(), runtimeMs: episode.duration, characters: this.characters(), assets: this.assets(), acts: episode.acts, shots: episode.shots, continuity: this.continuity(), renderPlan: this.renderPlan(episode.duration), exportTargets: this.exports() };
  }

  static title(text) { return `20 Minute Original Cartoon: ${text.split(/[.!?]/)[0].slice(0, 44) || 'Awtsmoos Studio'}`; }
  static style() { return 'Original adult-family cartoon grammar: thick outlines, expressive faces, satirical pacing, safe original cast.'; }
  static characters() { return [
    { name: 'Inventor Parent', detail: 'hair tufts, coat folds, 12 mouth shapes' },
    { name: 'Practical Parent', detail: 'clean silhouette, eyebrow acting, hand poses' },
    { name: 'Brainy Kid', detail: 'glasses glints, fast blinks, prop grip set' },
    { name: 'Wild Toddler', detail: 'soft hair/fur-like fuzz pass, squash timing' },
    { name: 'Dry Talking Pet', detail: 'fur cards, tail arcs, muzzle phonemes' }
  ]; }
  static assets() { return ['Kitchen', 'Street', 'School', 'Park', 'Cutaway Void', 'Vehicle', 'Prop Crate', 'Foley Pack']; }
  static continuity() { return ['opened doors persist', 'damaged props stay damaged', 'clothing/fur state carries across scenes', 'A/B jokes callback in tag']; }
  static renderPlan(ms) { return { draft: 'low-res animatic', preview: '720p timing pass', final: '1080p polished cartoon', totalMs: ms }; }
  static exports() { return ['20+ minute NLE timeline', 'screenplay pages', 'dialogue audio manifest', 'animation pass list', 'render queue', 'one-minute MP4 proof render']; }
}
