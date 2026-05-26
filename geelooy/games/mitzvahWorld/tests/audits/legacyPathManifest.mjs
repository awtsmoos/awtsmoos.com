/**
 * B"H
 * Declares which apparently-extra paths are intentional legacy/prototype surfaces.
 */
export const LEGACY_PATH_MANIFEST = [
  { path: 'main.html', kind: 'legacy-html-entry', active: false, reason: 'Older entry shell; active entry is index.html.' },
  { path: 'secretEditor.html', kind: 'manual-tool', active: false, reason: 'Standalone editor tool; not game boot path.' },
  { path: 'src/core', kind: 'prototype-controller', active: false, reason: 'Console-simulated registry architecture, not active Three/Olam boot.' },
  { path: 'src/ui', kind: 'prototype-ui', active: false, reason: 'Prototype UI data path; active menu is ckidsAwtsmoos/Olam/uiManager.' },
  { path: 'src/levels', kind: 'prototype-blueprints', active: false, reason: 'Registry blueprints preserved for compatibility and audited alignment.' },
  { path: 'mainThread', kind: 'legacy-thread-surface', active: false, reason: 'Present but not referenced by index.js boot chain.' }
];
