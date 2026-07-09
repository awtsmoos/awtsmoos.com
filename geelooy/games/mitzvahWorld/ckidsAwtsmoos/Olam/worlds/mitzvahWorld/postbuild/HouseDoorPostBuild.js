
/**
 * B"H
 * @file HouseDoorPostBuild.js
 * @description
 * Compatibility bridge to the real door system.
 */

import { ensureHouseDoors } from "../doors/EnsureHouseDoors.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

export { ensureHouseDoors };
export default ensureHouseDoors;
