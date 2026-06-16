// B"H
/** @file ZoneDiscoveryRuntime.js @description Named area discovery wrapper. */
import { checkLandmarkDiscovery } from "./LandmarkDiscoveryRuntime.js";
export function updateZoneDiscovery(olam) { return checkLandmarkDiscovery(olam); }
export default { updateZoneDiscovery };
