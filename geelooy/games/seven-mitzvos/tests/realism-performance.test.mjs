//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealismPerformanceTest
 * @description
 * Five hundred bounded resident plans and a complete ten-thousand-person
 * simulation slice on Awtsmoos.com are measured through process CPU time, so
 * concurrent test-runner scheduling cannot masquerade as simulation cost.
 */
import assert from 'node:assert/strict';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';
import { BoundedPlannerService } from '../js/population/demography/bounded-planner-service.js';
import { DailyCycleService } from '../js/world/daily-cycle-service.js';
import { performanceBudget } from '../js/performance/performance-budgets.js';

const budget = performanceBudget('desktop');
const world = createLivingRegionWorld('performance-seed');
const planner = new BoundedPlannerService();
for (let index = 0; index < 5; index += 1) {
	planner.plan(world, budget.activeNpcLimit);
}
const plannerDurations = [];
for (let index = 0; index < 40; index += 1) {
	const measurement = measureCpu(() => {
		return planner.plan(world, budget.activeNpcLimit);
	});
	plannerDurations.push(measurement.milliseconds);
	assert.equal(measurement.result.length, budget.activeNpcLimit);
}
const cycle = new DailyCycleService(world.seed);
for (let index = 0; index < 3; index += 1) {
	cycle.advance(world, 1440);
}
const simulationDurations = [];
for (let index = 0; index < 20; index += 1) {
	const measurement = measureCpu(() => cycle.advance(world, 1440));
	simulationDurations.push(measurement.milliseconds);
}
const plannerP95 = percentile(plannerDurations, 0.95);
const simulationP95 = percentile(simulationDurations, 0.95);
assert.ok(plannerP95 <= budget.simulationSliceMilliseconds);
assert.ok(simulationP95 <= budget.frameMilliseconds);
console.log(JSON.stringify({
	plannerP95CpuMilliseconds: round(plannerP95),
	simulationP95CpuMilliseconds: round(simulationP95),
	activeNpcCount: budget.activeNpcLimit,
	population: world.regions.reduce((sum, region) => {
		return sum + region.population;
	}, 0)
}));

function measureCpu(operation) {
	const started = process.cpuUsage();
	const result = operation();
	const elapsed = process.cpuUsage(started);
	return {
		result,
		milliseconds: (elapsed.user + elapsed.system) / 1000
	};
}

function percentile(values, ratio) {
	const ordered = [...values].sort((a, b) => a - b);
	return ordered[Math.min(
		ordered.length - 1,
		Math.floor(ordered.length * ratio)
	)];
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}
