// B"H
/** Feature100CoverageAudit: verifies every feature maps to a runtime. */
import { FEATURE100 } from './Feature100Registry.js';
const MAP = Object.freeze({ society:'Feature100SocietyRuntime', cognition:'Feature100CognitionRuntime', ecology:'Feature100EcologyRuntime', economy:'Feature100EconomyRuntime', construction:'Feature100ConstructionRuntime', physics:'Feature100PhysicsRuntime', animation:'Feature100AnimationRuntime', audio:'Feature100AudioRuntime', torah:'Feature100TorahRuntime', engine:'Feature100EngineRuntime' });
export function auditFeature100Coverage(){ const rows=FEATURE100.map(f=>({ ...f, runtime:MAP[f.domain] || null })); return { ok:rows.every(r=>r.runtime), total:rows.length, uncovered:rows.filter(r=>!r.runtime), rows }; }
export default auditFeature100Coverage;
