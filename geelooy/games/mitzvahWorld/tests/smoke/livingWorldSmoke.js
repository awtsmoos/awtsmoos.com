// B"H
/**
 * Smoke test for the integrated living-world runtime. This verifies that the
 * registry, coverage audit, budgeted stepper, domain operations, and memory
 * fallback all work without a browser.
 */
import { auditLivingWorldCoverage } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldCoverageAudit.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
const scope = globalThis;
scope.__MITZVAH_WORLD_REALISM_BUDGET__ = { level:'steady', scheduler:{ maxTasksPerTick:3 } };
const living = createLivingWorldRuntime(scope).start('smoke');
living.resetLivingWorldState();
living.Society.longTermAmbitions('rebbe_akiva', { ambition:'raise a generation of helpers' });
living.Cognition.beliefFormation('miriam_baker', { belief:'the player keeps promises', confidence:.7 });
living.Ecology.pollination('orchard', { bees:12, flowers:80 });
living.Economy.seasonalPrices('market', { wheat:11, oil:18 });
living.Construction.roadImprovement('village_road', { progress:2 });
living.Torah.hiddenKindness('anonymous_coin', { seen:false, merit:'quiet' });
const step = living.step('smoke-budgeted-step');
const audit = auditLivingWorldCoverage();
const snapshot = living.snapshot();
const result = { ok:audit.ok && audit.total >= 275 && step.selected.length === 3 && snapshot.state.events.length > 0, auditTotal:audit.total, uncovered:audit.uncovered.length, selected:step.selected, domains:snapshot.domains.length, events:snapshot.state.events.length };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
