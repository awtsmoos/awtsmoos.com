// B"H
/**
 * @file runtimeAdapters.js
 * @brief Runtime adapters backed by the shared Awtsmoos router.
 */

import { routeAwtsmoosAction } from '../../../../../shared/awtsmoos-runtime/index.js';
import { recordRuntimeEvent } from './runtimeTimeline.js';

const INTENT_TO_ACTION = Object.freeze({
  'files.search': 'grep',
  'files.list': 'list',
  'files.read': 'read',
  'files.write': 'write',
  'semantic.search': 'grep',
  'workflow.run': 'simulateRuntime',
  'browser.inspect': 'simulateRuntime',
  'terminal.run': 'command'
});

function normalizePayload(intent, payload = {}) {
  if (intent === 'files.search' || intent === 'semantic.search') return { query: payload.q || payload.query || '' };
  if (intent === 'workflow.run') return { runtime: 'virtual', workflow: payload.workflow || 'virtual' };
  if (intent === 'browser.inspect') return { runtime: 'browser', html: payload.html || '' };
  if (intent === 'terminal.run') return { command: payload.command || payload.text || '' };
  return payload;
}

export function createRuntimeAdapter(runtime) {
  const caps = runtime?.mountedCapabilities || {};

  return {
    id: runtime?.id || 'unknown',
    runtime,
    can(capability) { return !!caps[capability]; },
    describe() { return { id: runtime?.id, mode: runtime?.mode, root: runtime?.activeRoot, capabilities: caps }; },
    async invoke(intent, payload = {}) {
      const event = recordRuntimeEvent({ runtimeId: runtime?.id, type: 'intent.invoke', summary: `Invoke ${intent}`, payload: { intent, payload } });
      const action = INTENT_TO_ACTION[intent] || intent;
      const result = await routeAwtsmoosAction({ action, args: normalizePayload(intent, payload), preferVirtual: runtime?.mode === 'virtual-os' });
      return { ...result, eventId: event.id, intent, runtimeId: runtime?.id };
    }
  };
}
