// B"H
/** Compatibility summary only. No renderer import lives here. */
import { SEFIROS_BACKEND_CONTRACT } from "./SefirosBackendContract.js";
export function sefirosToLegacyThreeSummary(scenePlan = {}) {
  return { backend:"legacy_3d_compatibility_summary", contract:SEFIROS_BACKEND_CONTRACT, packets:scenePlan.sefiros?.items?.length || 0, note:"actual adapter must live behind the gateway" };
}
