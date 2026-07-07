// B\"H
import assert from 'node:assert/strict';
import { bootBudgetSummary } from '../../ckidsAwtsmoos/Olam/boot/CriticalBootPlan.js';

const budget = bootBudgetSummary([
  { type: 'ProceduralTerrain', options: {} },
  { type: 'Chossid', options: {} },
  { type: 'InteractiveNpc', options: {} },
  { type: 'VillagePictureProp', options: {} }
]);
assert.equal(budget.critical, 2);
assert.equal(budget.deferred, 2);
assert.ok(budget.critical < budget.total);
console.log('B\"H firstPlayableBudgetAudit passed');
