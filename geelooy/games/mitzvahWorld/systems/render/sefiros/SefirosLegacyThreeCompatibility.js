// B"H
/** Compatibility summary only. No renderer import lives here. */
import { SEFIROS_BACKEND_CONTRACT } from "./SefirosBackendContract.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function sefirosToLegacyThreeSummary(scenePlan = {}) {
  return { backend:"legacy_3d_compatibility_summary", contract:SEFIROS_BACKEND_CONTRACT, packets:scenePlan.sefiros?.items?.length || 0, note:"actual adapter must live behind the gateway" };
}
