// B"H
import { SIMULATION_TIERS } from '../../systems/realism/SimulationInterestTiers.js';
import { buildLivingWorldReport } from '../../systems/realism/LivingWorldBootstrap.js';
if(SIMULATION_TIERS.far.mode!=='summary'||SIMULATION_TIERS.region.hz>1) throw new Error('Far realism simulation is too expensive');
const report=buildLivingWorldReport({});
if(report.frameCost!=='event-driven-and-tiered') throw new Error('Living world must be event-driven and tiered');
console.log('B"H livingWorldNoFrameCostAudit passed');
