// B"H

/**
 * @file AutoPlayCovenant.js
 * @description
 * ============================================================================
 * CHAPTER: THE DEFAULT PLAYBACK THAT STAYS ALIVE
 * ============================================================================
 *
 * RenderLoop imports this file directly. Default playback continues unless the
 * user intentionally pauses.
 *
 * @class AutoPlayCovenant
 */
export class AutoPlayCovenant {
  /**
   * Ensures play.
   *
   * @param {Object} app - App.
   * @param {Object} options - Options.
   * @returns {boolean} Playing.
   */
  static ensure(app, options = {}) {
    if (!app?.state || !app?.director) return false;

    const sequence = app.state.get('activeSequence');
    if (!sequence || !Array.isArray(sequence.events)) return false;

    const force = options.force === true;
    if (app.state.get('userPausedPlayback') && !force) {
      app.state.set('isPlaying', false, true);
      return false;
    }

    if (!app.director.isPlaying) {
      app.director.play(sequence, 0);
    }

    app.director.isPlaying = true;
    app.state.set('isPlaying', true, true);
    return true;
  }

  /**
   * Resume.
   *
   * @param {Object} app - App.
   * @returns {boolean} Playing.
   */
  static resume(app) {
    if (!app?.state) return false;
    app.state.set('userPausedPlayback', false, true);
    return this.ensure(app, { force: true });
  }

  /**
   * Pause by user.
   *
   * @param {Object} app - App.
   * @returns {void}
   */
  static pauseByUser(app) {
    if (!app?.state || !app?.director) return;
    app.director.isPlaying = false;
    app.state.set('userPausedPlayback', true, true);
    app.state.set('isPlaying', false, true);
  }

  /**
   * Toggle.
   *
   * @param {Object} app - App.
   * @returns {boolean} Playing.
   */
  static toggle(app) {
    if (app?.director?.isPlaying) {
      this.pauseByUser(app);
      return false;
    }
    return this.resume(app);
  }
}