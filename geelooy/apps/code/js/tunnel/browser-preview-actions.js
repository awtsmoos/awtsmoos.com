// B"H
import { PreviewControlRegistry } from '../html-preview/control/registry.js';
import { PREVIEW_CONTROL_ACTIONS } from '../html-preview/control/actions.js';

/**
 * Chapter 111: The preview opened a window without stealing the request name.
 */
export const BROWSER_PREVIEW_ACTIONS = Object.freeze([
  ...PREVIEW_CONTROL_ACTIONS,
  'previewFile', 'previewFolder', 'previewPage',
  'previewActionResult', 'previewWorkspace', 'previewLiveEditor'
]);

export async function handleBrowserPreviewAction(payload = {}) {
  const requestedAction = payload.action || payload.previewAction || 'previewFile';
  const controlAction = normalizePreviewControl(payload);
  const tabId = payload.tabId || payload.previewTabId;
  if (!tabId) return fail(requestedAction, 'preview_tabId_required');
  if (!PREVIEW_CONTROL_ACTIONS.includes(controlAction)) {
    return fail(requestedAction, 'unsupported_preview_action', { controlAction });
  }
  const result = await PreviewControlRegistry.send(tabId, controlAction, payload.payload || payload, Number(payload.timeoutMs || 5000));
  return { ok: result.ok !== false, action: requestedAction, preview: { action: controlAction, tabId, result } };
}

function normalizePreviewControl(payload = {}) {
  const action = payload.previewAction || payload.controlAction || payload.action || 'previewFile';
  return String(action).replace(/^preview:/, '').replace(/^preview(File|Folder|Page|Workspace|LiveEditor)$/, 'focus');
}
function fail(action, error, extra = {}) {
  return { ok: false, status: 400, action, error, availableActions: BROWSER_PREVIEW_ACTIONS, ...extra };
}
