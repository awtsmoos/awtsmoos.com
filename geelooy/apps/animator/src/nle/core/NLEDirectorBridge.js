// B"H

/**
 * @file NLEDirectorBridge.js
 * @description
 * Chapter Twenty-Six: The editor became a tiny director monitor.
 *
 * The NLE now mirrors not just time, but the current shot, speaker, and line.
 * This makes the bottom bar explain the film instead of looking like empty UI.
 */
export class NLEDirectorBridge {
  /**
   * Synchronizes one frame of director state into the NLE store.
   *
   * @param {Object} app - App object.
   * @returns {void}
   */
  static sync(app) {
    const store = app?.state?.get?.('nle_store');
    if (!store || typeof store.set !== 'function') return;

    const time = Number(app.state.get('director_time')) || 0;
    const camera = app.state.get('camera') || {};
    const dialogue = app.state.get('activeDialogue') || {};
    const current = store.get ? store.get() : {};
    const shot = camera.cameraId || camera.shot || 'stage';
    const speaker = dialogue.speakerName || dialogue.speakerId || dialogue.id || 'none';
    const line = dialogue.text || '';

    if (
      Math.abs((current.playhead || 0) - time) < 16 &&
      current.currentShot === shot &&
      current.currentSpeaker === speaker &&
      current.currentLine === line
    ) return;

    store.set({
      playhead: time,
      currentShot: shot,
      currentSpeaker: speaker,
      currentLine: line
    });
  }
}
