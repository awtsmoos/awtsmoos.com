// B"H

/**
 * @file MobileSafeAreaController.js
 * @description
 * Reads real UI sizes and writes CSS variables used by both CSS and camera JS.
 */
export class MobileSafeAreaController {
  /**
   * Installs resize observers and first pass.
   *
   * @returns {void}
   */
  static install() {
    this.refresh();
    window.addEventListener('resize', () => this.refresh(), { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(() => this.refresh(), 120), { passive: true });
  }

  /**
   * Refreshes CSS variables.
   *
   * @returns {void}
   */
  static refresh() {
    const dock = this.findDock();
    const h = dock ? Math.ceil(dock.getBoundingClientRect().height) : (window.innerWidth <= 780 ? 118 : 64);
    const root = document.documentElement;
    root.style.setProperty('--aw-dock-height', `${h}px`);
    root.style.setProperty('--aw-stage-safe-bottom', `${h + 28}px`);
  }

  /**
   * Finds active dock.
   *
   * @returns {Element|null} Dock element.
   */
  static findDock() {
    return document.querySelector('.awtsmoos-mobile-dock, .mobile-dock, .bottom-dock, .workspace-chrome, [data-awtsmoos-dock]');
  }
}

MobileSafeAreaController.install();