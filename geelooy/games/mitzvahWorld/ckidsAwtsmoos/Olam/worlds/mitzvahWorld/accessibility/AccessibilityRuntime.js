/**
 * B"H
 * Chapter 46: Every Hand Found Its Own Gate.
 */

export class AccessibilityRuntime {
  constructor(settings = {}) {
    this.settings = { textScale: 1, reducedMotion: false, highContrast: false, ...settings };
  }

  update(patch) {
    this.settings = { ...this.settings, ...patch };
    return this.snapshot();
  }

  remap(action, input) {
    this.settings.bindings = { ...(this.settings.bindings || {}), [action]: input };
    return this.settings.bindings;
  }

  snapshot() {
    return { ...this.settings };
  }
}

export default AccessibilityRuntime;
