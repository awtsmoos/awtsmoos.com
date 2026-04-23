
/* B”H */

/**
 * @class AppLayout
 * @description
 * The 'Tokhnit' (Plan) of Existence.
 * Defines the absolute architectural grid for the Park Creator. 
 * It ensures that the Premiere Pro monitor, the retractable sidebar, 
 * and the NLE timeline occupy their pre-ordained Sefirotic coordinates.
 */
export class AppLayout {
  /**
   * The master schema that defines the whole UI world.
   */
  static getSchema() {
    return {
      tag: 'div',
      attr: { id: 'app-shell', className: 'app-shell' },
      children: [
        {
          tag: 'aside',
          attr: { id: 'left-sidebar', className: 'retractable-sidebar' },
          children: [
            {
              tag: 'div',
              attr: { className: 'sidebar-header' },
              children: [{ tag: 'h1', attr: { className: 'app-title' }, children: 'PARK_CREATOR' }]
            },
            { tag: 'div', attr: { id: 'editor-container', className: 'editor-mount' } }
          ]
        },
        {
          tag: 'main',
          attr: { id: 'main-stage', className: 'main-stage' },
          children: [
            { tag: 'div', attr: { id: 'hud-overlay' } },
            // ViewportManager will inject the letterbox container here
            { tag: 'div', attr: { id: 'prop-panel', className: 'properties-panel' }, children: [{ tag: 'div', attr: { className: 'prop-content' } }] },
            { tag: 'div', attr: { id: 'workspace-mount', className: 'workspace-overlay' } }
          ]
        },
        {
          tag: 'div',
          attr: { id: 'nle-timeline-container', className: 'nle-outer' },
          children: [{ tag: 'div', attr: { id: 'nle-timeline' } }]
        }
      ]
    };
  }
}
