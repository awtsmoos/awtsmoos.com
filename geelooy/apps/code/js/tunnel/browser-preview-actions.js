// B\"H

import { PreviewControlRegistry } from '../html-preview/control/registry.js';
import { PREVIEW_CONTROL_ACTIONS } from '../html-preview/control/actions.js';

export const BROWSER_PREVIEW_ACTIONS = PREVIEW_CONTROL_ACTIONS;

export async function handleBrowserPreviewAction(payload = {}) {
    const tabId = payload.tabId || payload.previewTabId;
    if (!tabId) return { ok: false, status: 400, error: 'preview_tabId_required' };
    const action = payload.action || payload.previewAction;
    if (!PREVIEW_CONTROL_ACTIONS.includes(action)) {
        return { ok: false, status: 400, error: 'unsupported_preview_action', action, availableActions: BROWSER_PREVIEW_ACTIONS };
    }
    const result = await PreviewControlRegistry.send(tabId, action, payload.payload || payload, Number(payload.timeoutMs || 5000));
    return { ok: result.ok !== false, action: 'preview:' + action, ...result };
}
