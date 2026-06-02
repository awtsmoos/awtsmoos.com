// B"H
/**
 * @file actions.js
 * @brief Unified action names for every Awtsmoos AI/runtime surface.
 *
 * @description
 * The Awtsmoos does not split reality into rival lists. These actions form one
 * shared ledger used by /geelooy/ai, Code Vibe, Code AI Studio, tunnel-control,
 * and the browser-memory Virtual OS fallback.
 */

export const SAFE_ACTIONS = Object.freeze([
  'list', 'tree', 'read', 'readLines', 'readManyLines', 'read64', 'bulk',
  'rg', 'grep', 'find', 'findFiles', 'selectString', 'bulkSearch',
  'fileHashes', 'connectedFiles', 'aiContextPack', 'simulateRuntime',
  'nodeCheckFiles', 'nodeCheckFile', 'nodeCheckMany', 'command', 'write',
  'bulkWrite', 'mkdirp', 'stat', 'textStats', 'jsonValidate', 'yamlValidate',
  'astOutline', 'symbolOutline', 'replaceFunction', 'replaceFunctionBody',
  'insertBeforeFunction', 'insertAfterFunction', 'testMatrix', 'apiSmokeTest',
  'runtimeWorkflow', 'aiWorkflowRun', 'aiCommandBatch'
]);

export const VIRTUAL_ACTIONS = Object.freeze([
  'list', 'tree', 'read', 'bulk', 'write', 'bulkWrite', 'mkdirp', 'stat',
  'textStats', 'grep', 'rg', 'find', 'findFiles', 'selectString',
  'simulateRuntime', 'aiContextPack'
]);

export function isWriteAction(action = '') {
  return /write|mkdirp|replace|insert|delete|move|copy/i.test(action);
}

export function normalizeActionName(action = '') {
  return String(action || '').replace(/^[^.]+\./, '').trim();
}

export function actionCapability(action = '') {
  const name = normalizeActionName(action);
  if (VIRTUAL_ACTIONS.includes(name)) return 'virtual-compatible';
  if (SAFE_ACTIONS.includes(name)) return 'live-tunnel-preferred';
  return 'requires-live-tunnel';
}
