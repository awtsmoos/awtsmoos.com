// B"H
import { nearbyWorldEvents } from '../../systems/missions/WorldEventDirector.js';
import { missionDensityBudget } from '../../systems/missions/MissionDensityBudget.js';
const events=nearbyWorldEvents({seed:2,count:5}); if(events.some(e=>e.frameCost!=='event-driven')) throw new Error('Mission event has frame cost');
if(!missionDensityBudget({fps:60}).eventDriven) throw new Error('Mission density must be event-driven');
console.log('B"H missionDensityNoFrameCostAudit passed');
