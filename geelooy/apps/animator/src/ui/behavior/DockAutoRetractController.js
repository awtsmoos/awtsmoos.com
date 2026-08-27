// B"H

/**
 * @file DockAutoRetractController.js
 * @description
 * Keeps the mobile dock from permanently covering the actors.
 */
export class DockAutoRetractController {
  static timer = null;

  /**
   * Installs dock auto retract.
   *
   * @returns {void}
   */
  static install() {
    ['pointerdown', 'pointermove', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, () => this.wake(), { passive: true });
    });
    this.wake();
  }

  /**
   * Wakes dock briefly.
   *
   * @returns {void}
   */
  static wake() {
    document.body.classList.remove('aw-dock-retracted');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!document.body.classList.contains('aw-panel-open')) {
        document.body.classList.add('aw-dock-retracted');
      }
    }, 2600);
  }
}

DockAutoRetractController.install();