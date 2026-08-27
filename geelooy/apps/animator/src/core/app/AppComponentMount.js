// B"H

/**
 * @file AppComponentMount.js
 * @description
 * ============================================================================
 * CHAPTER: THE MOUNTER THAT STOPPED CONFUSING APP WITH STATE
 * ============================================================================
 *
 * A crash ripped through the console: this.state.get is not a function. The
 * cause was not mystical. A component that expected state received app. Then
 * it reached for state.get and found only silence.
 *
 * This helper creates components through their real constructor covenant:
 * state first, app second. If the component is a modern Component subclass,
 * it can render and mount. If it is an older self-mounting vessel, merely
 * constructing it is enough.
 *
 * The Awtsmoos creates order from nothing every instant. This class is a tiny
 * order-maker: no swapped arguments, no fake mount objects, no broken breath.
 *
 * @class AppComponentMount
 */
export class AppComponentMount {
  /**
   * Creates and mounts a component safely.
   *
   * @param {Function} ComponentClass - Class constructor to instantiate.
   * @param {Object} app - Application core.
   * @param {HTMLElement|null} mount - Optional DOM mount element.
   * @returns {Object|null} Component instance or null.
   */
  static create(ComponentClass, app, mount = null) {
    if (!ComponentClass || !app || !app.state) return null;

    const instance = new ComponentClass(app.state, app);

    if (mount && typeof instance.mount === 'function') {
      instance.mount(mount);
    } else if (mount && typeof instance.render === 'function') {
      const node = this.renderToNode(instance);
      if (node) {
        mount.innerHTML = '';
        mount.appendChild(node);
        instance.element = node;
        if (typeof instance.onMount === 'function') instance.onMount();
      }
    }

    return instance;
  }

  /**
   * Converts a component render result into a DOM node.
   *
   * @param {Object} instance - Component instance.
   * @returns {HTMLElement|null} DOM node or null.
   */
  static renderToNode(instance) {
    const schema = instance.render();
    if (!schema) return null;

    const generator = this.getGenerator();
    return generator ? generator.generate(schema) : null;
  }

  /**
   * Finds the already-loaded HTMLGenerator without creating import loops.
   *
   * @returns {Object|null} HTMLGenerator-like object.
   */
  static getGenerator() {
    return window.AwtsmoosHTMLGenerator || null;
  }
}