// B"H
/**
 * @file index.js
 * @brief Public exports for the unified Awtsmoos runtime.
 */

export { SAFE_ACTIONS, VIRTUAL_ACTIONS, actionCapability, isWriteAction, normalizeActionName } from './actions.js';
export { VirtualFilesystem, sharedVirtualFilesystem } from './virtual-fs.js';
export { makeRuntimeToolBridge, routeAwtsmoosAction } from './router.js';
export { buildSharedAgentMessages, buildToolManifest, executeAgentTool, runSharedAgent } from './agent-core.js';
