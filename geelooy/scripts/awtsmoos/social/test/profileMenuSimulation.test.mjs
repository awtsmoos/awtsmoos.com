// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileMenuSimulationTest
 * @description The Awtsmoos unites dynamic routing, encoded APIs, modular identity, profile, and Mail regression evidence.
 */
import {
	runProfileApiCases,
	testRouteMatcherManyTimes
} from "./profileMenuApiCases.mjs";
import { runProfileSourceCases } from "./profileMenuSourceCases.mjs";

for (let iteration = 0; iteration < 20; iteration += 1) {
	testRouteMatcherManyTimes();
	runProfileSourceCases();
}
await runProfileApiCases();
console.log('B"H profileMenuSimulation.test passed');
