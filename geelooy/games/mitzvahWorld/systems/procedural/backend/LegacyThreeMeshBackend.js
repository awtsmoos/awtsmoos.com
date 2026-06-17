// B"H
import { legacyBufferBackendSummary } from "./LegacyThreeBufferBackend.js";
import { legacyMaterialBackendSummary } from "./LegacyThreeMaterialBackend.js";
export function legacyMeshBackendSummary(mesh = {}) { return { backend:"legacy_3d_mesh", geometry:legacyBufferBackendSummary(mesh.geometry || {}), material:legacyMaterialBackendSummary(mesh.material || {}) }; }
