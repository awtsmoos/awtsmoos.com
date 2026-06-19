// B"H

/**
 * @file AppLayout.js
 * @description
 * One declarative shell for the park engine. No spare mobile nav, no duplicate
 * root canvas, no hidden parallel layout. The Awtsmoos reveals order through
 * one vessel: left tools, center stage, right inspector, lower timeline.
 */
export class AppLayout {
  /**
   * Returns the master schema consumed by HTMLGenerator.
   *
   * @returns {Object} Complete app layout schema.
   */
  static getSchema() {
    return {
      tag: 'div',
      attr: { id: 'app-shell', className: 'app-shell' },
      children: [
        this.sidebarLeft(),
        this.resizer('v-resizer-left', 'resizer-bar v-resizer left-resizer'),
        this.stage(),
        this.resizer('v-resizer-right', 'resizer-bar v-resizer right-resizer'),
        this.sidebarRight(),
        this.resizer('h-resizer', 'resizer-bar h-resizer'),
        this.timeline()
      ]
    };
  }

  /**
   * Builds the left editing vessel.
   *
   * @returns {Object} Schema node.
   */
  static sidebarLeft() {
    return {
      tag: 'aside',
      attr: { id: 'left-sidebar', className: 'app-sidebar-left' },
      children: [
        this.header('GEVURAH // ACTOR EDITOR', true),
        { tag: 'div', attr: { id: 'editor-container', className: 'editor-mount scrollable' } },
        { tag: 'div', attr: { id: 'workspace-mount', className: 'workspace-mount scrollable' } }
      ]
    };
  }

  /**
   * Builds the central canvas stage.
   *
   * @returns {Object} Schema node.
   */
  static stage() {
    return {
      tag: 'main',
      attr: { id: 'main-stage', className: 'app-stage' },
      children: [
        {
          tag: 'canvas',
          attr: { id: 'character-canvas', className: 'stage-canvas', width: '1920', height: '1080' }
        },
        { tag: 'div', attr: { id: 'hud-overlay', className: 'hud-overlay' } }
      ]
    };
  }

  /**
   * Builds the right inspector vessel.
   *
   * @returns {Object} Schema node.
   */
  static sidebarRight() {
    return {
      tag: 'aside',
      attr: { id: 'right-sidebar', className: 'app-sidebar-right' },
      children: [
        this.header('NETZACH // PROPERTIES', false),
        { tag: 'div', attr: { id: 'inspector-mount', className: 'inspector-mount scrollable' } }
      ]
    };
  }

  /**
   * Builds the timeline host.
   *
   * @returns {Object} Schema node.
   */
  static timeline() {
    return {
      tag: 'footer',
      attr: { id: 'nle-timeline', className: 'app-timeline' },
      children: [{ tag: 'button', attr: { id: 'timeline-toggle', className: 'timeline-toggle' }, children: 'MALCHUT // TIME' }]
    };
  }

  /**
   * Builds one sidebar header.
   *
   * @param {string} title - Visible title.
   * @param {boolean} withToggle - Whether to include desktop collapse control.
   * @returns {Object} Schema node.
   */
  static header(title, withToggle) {
    const children = [{ tag: 'h1', children: title }];
    if (withToggle) children.push({ tag: 'button', attr: { id: 'toggle-sidebar', className: 'btn-toggle' }, children: '◀' });
    return { tag: 'div', attr: { className: 'sidebar-header' }, children };
  }

  /**
   * Builds a resize rail without behavior pollution.
   *
   * @param {string} id - Element id.
   * @param {string} className - Element class.
   * @returns {Object} Schema node.
   */
  static resizer(id, className) {
    return { tag: 'div', attr: { id, className } };
  }
}
