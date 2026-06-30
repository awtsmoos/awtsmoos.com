// B"H
/**
 * The desktop speaks when action becomes consequence.
 * In the chamber of the Awtsmoos, silence is not humility when a user clicked.
 * Every success may glow; every failure must carry a name and an explanation.
 */
export function notifyDesktop(os, text, kind = 'info') {
  os?.taskbar?.notify?.(text, kind);
  return { text, kind, at:Date.now() };
}

/** @param {object} os @param {string} action @param {unknown} error */
export function explainFailure(os, action, error) {
  const message = error?.message || String(error || 'Unknown failure');
  notifyDesktop(os, `${action} failed: ${message}`, 'error');
  return { ok:false, action, message };
}
