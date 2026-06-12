import { MAPS } from '../js/data/maps.js';
import { simulateMatch } from '../js/ai/advanced/test/headlessMatchSimulator.js';

const map = MAPS.find(m => m.id === 'merkava-pinball-court') || MAPS[0];
const report = simulateMatch(map, { frames: 12000, botCount: 5, fast: true, stopOnWinner: false, sampleEvery: 0 });
console.log(JSON.stringify({
  ok: report.health.ok,
  failures: report.health.failures,
  warnings: report.health.warnings,
  framesRun: report.framesRun,
  longestNoPressureWindow: report.longestNoPressureWindow,
  currentNoPressureWindow: report.currentNoPressureWindow,
  combatEnded: report.combatEnded,
  combatEndedAt: report.combatEndedAt,
  alive: report.alive,
  koCount: report.koCount,
  damageEnd: report.damageEnd,
  attackCommands: report.attackCommands,
  attackReasons: report.attackReasons,
  states: report.states,
  opportunities: report.opportunities,
  attackIntent: report.attackIntent,
  finalStocks: report.finalStocks
}, null, 2));
