// B"H

/**
 * @file AnimatorMovieExportEngine.js
 * @description
 * A bridge from the piano app's busy video-export covenant into Animator: gather
 * path, duration, text tags, eye tags, queue metadata, and an external renderer
 * command so the studio can create a real movie artifact, not merely a promise.
 */
export class AnimatorMovieExportEngine {
  static oneMinutePlan(plan) {
    return {
      source: 'geelooy/apps/piano video-worker + MediaBunny pattern, adapted to Animator FFmpeg export',
      durationSeconds: 60,
      title: plan.title,
      targetFolder: '~/Movies/AwtsmoosAnimatorExports/<timestamp>',
      fileName: 'awtsmoos-animator-one-minute-eye-tags.mp4',
      overlays: ['eye tag title boxes', 'act labels', 'NLE beat labels', 'render status boxes'],
      command: 'node tools/render/exportOneMinuteMovie.js'
    };
  }
}
