// B"H
import { legacyBufferBackendSummary } from "./LegacyThreeBufferBackend.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { legacyMaterialBackendSummary } from "./LegacyThreeMaterialBackend.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function legacyMeshBackendSummary(mesh = {}) { return { backend:"legacy_3d_mesh", geometry:legacyBufferBackendSummary(mesh.geometry || {}), material:legacyMaterialBackendSummary(mesh.material || {}) }; }
