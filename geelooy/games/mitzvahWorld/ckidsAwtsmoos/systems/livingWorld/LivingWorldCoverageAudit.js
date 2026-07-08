// B"H
/** LivingWorldCoverageAudit: proves every brainstormed living-world idea maps to a domain runtime. */
import { LIVING_WORLD_IDEAS } from './LivingWorldRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const RUNTIME_BY_DOMAIN = Object.freeze({ society:'SocietyLivingRuntime', cognition:'CognitionLivingRuntime', ecology:'EcologyLivingRuntime', economy:'EconomyLivingRuntime', construction:'ConstructionLivingRuntime', physics:'PhysicsLivingRuntime', animation:'AnimationLivingRuntime', audio:'AudioLivingRuntime', torah:'TorahLivingRuntime', engine:'EngineLivingRuntime', world:'WorldLivingRuntime' });
export function auditLivingWorldCoverage(){ const rows=LIVING_WORLD_IDEAS.map(item=>({ ...item, runtime:RUNTIME_BY_DOMAIN[item.domain] || null })); return { ok:rows.every(row=>row.runtime), total:rows.length, uncovered:rows.filter(row=>!row.runtime), domains:Object.keys(RUNTIME_BY_DOMAIN), rows }; }
export default auditLivingWorldCoverage;
