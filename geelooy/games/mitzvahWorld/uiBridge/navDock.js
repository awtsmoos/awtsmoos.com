// B"H
/**
 * @file navDock.js
 * @purpose Compatibility shell for the removed duplicate navigation dock.
 * @owner Live mitzvahWorld UI bridge; canonical action ownership lives in #actionBar.
 * @inputs Legacy imports that still ask for installNavDock or closeAllPanels.
 * @outputs No DOM dock; closeAllPanels remains available through closePanels.js.
 * @runtimeAuthority No action authority. This file must not create action UI.
 * @updateOrder Imported only for old compatibility after closePanels.js exists.
 * @callers Legacy bridge imports until they are fully retired.
 * @invariants No #mitzvahActionDock, STRIKE grid, or keyboard action grid is emitted.
 * @failureModes installNavDock returns null to keep old callers harmless.
 */
export { closeAllPanels } from "./closePanels.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function installNavDock() { return null; }
export default installNavDock;
