// B"H
/**
 * @file index.js
 * @brief Public exports for the unified Awtsmoos runtime.
 *
 * Chapter 455: The public gate learned to name the ocean. Every app that
 * imports the shared runtime can now see the full generated tunnel catalog,
 * while still passing through the guarded router before anything touches a
 * local tunnel, OAuth vessel, or Virtual OS fallback.
 */

export {
  ALL_RUNTIME_ACTIONS,
  SAFE_ACTIONS,
  VIRTUAL_ACTIONS,
  actionCapability,
  isWriteAction,
  normalizeActionName
} from './actions.js';
export { VirtualFilesystem, sharedVirtualFilesystem } from './virtual-fs.js';
export { makeRuntimeToolBridge, routeAwtsmoosAction } from './router.js';
export { buildSharedAgentMessages, buildToolManifest, executeAgentTool, runSharedAgent } from './agent-core.js';
