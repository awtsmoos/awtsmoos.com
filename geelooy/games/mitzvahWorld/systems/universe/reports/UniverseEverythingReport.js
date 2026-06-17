// B"H
import { universeCinemaReport } from "./UniverseCinemaReport.js";
import { universeAnimationReport } from "./UniverseAnimationReport.js";
import { universeSefirosManifestReport } from "./UniverseSefirosManifestReport.js";
export function universeEverythingReport(parts = {}) { return { cinema:universeCinemaReport(parts.movie), animation:universeAnimationReport(parts.animations), sefiros:universeSefirosManifestReport(parts.physical), index:parts.index || null }; }
