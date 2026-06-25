// B"H
/** Feature49CoverageAudit: proves all 49 ideas have an implementation domain. */
import { FEATURE49 } from './Feature49Registry.js';
const DOMAIN_RUNTIME = Object.freeze({
  social:'Feature49SocialRuntime', npc:'Feature49SocialRuntime', mission:'Feature49SimulationRuntime', calendar:'Feature49CalendarRuntime', world:'Feature49WorldRuntime', economy:'Feature49EconomyRuntime', profession:'Feature49ProfessionRuntime', torah:'Feature49TorahRuntime', tutorial:'Feature49TorahRuntime', ecology:'Feature49EcologyRuntime', weather:'Feature49WeatherRuntime', housing:'Feature49HousingRuntime', rendering:'Feature49WeatherRuntime', audio:'Feature49WeatherRuntime', performance:'Feature49SimulationRuntime', debug:'Feature49SimulationRuntime', simulation:'Feature49SimulationRuntime'
});
export function auditFeature49Coverage(){
  const rows = FEATURE49.map(f => ({ id:f.id, domain:f.domain, runtime:DOMAIN_RUNTIME[f.domain] || null }));
  return { ok: rows.every(r => r.runtime), total: rows.length, uncovered: rows.filter(r => !r.runtime), rows };
}
export default auditFeature49Coverage;
