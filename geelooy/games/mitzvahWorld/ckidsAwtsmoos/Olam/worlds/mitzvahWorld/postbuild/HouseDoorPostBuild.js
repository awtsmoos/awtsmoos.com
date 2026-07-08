
/**
 * B"H
 * @file HouseDoorPostBuild.js
 * @description
 * Compatibility bridge to the real door system.
 */

import { ensureHouseDoors } from "../doors/EnsureHouseDoors.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export { ensureHouseDoors };
export default ensureHouseDoors;
