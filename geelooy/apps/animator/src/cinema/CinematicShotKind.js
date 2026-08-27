// B"H

/**
 * @file CinematicShotKind.js
 * @description
 * One truth for shot grammar. Camera, scene treatment, staging, captions, and
 * action rules should not each guess what a closeup or action shot means.
 */
export class CinematicShotKind {
  /**
   * Resolves shot kind from camera/event ids.
   *
   * @param {Object|string} source - Camera, event, or id string.
   * @returns {'close'|'action'|'walk'|'two'|'medium'|'wide'} Shot kind.
   */
  static resolve(source = {}) {
    const text = typeof source === 'string'
      ? source
      : `${source.cameraId || ''} ${source.id || ''} ${source.shot || ''} ${source.framing || ''} ${source.type || ''}`;

    if (/face|close|reaction|catch|insert/i.test(text)) return 'close';
    if (/throw|action|prop/i.test(text)) return 'action';
    if (/walk|tracking/i.test(text)) return 'walk';
    if (/two/i.test(text)) return 'two';
    if (/speaker|medium/i.test(text)) return 'medium';
    return 'wide';
  }

  /** @param {Object|string} source @returns {boolean} */
  static isClose(source) {
    return this.resolve(source) === 'close';
  }
}
