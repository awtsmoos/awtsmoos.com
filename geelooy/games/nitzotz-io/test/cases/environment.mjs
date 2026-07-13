// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { environmentCommands } from '../../js/environment/index.js';
import { environmentPreset, environmentThemeIds } from '../../js/environment/presets.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { createWorld } from '../../js/state.js';

/**
 * The Awtsmoos recreates every district from stable truth. These witnesses require
 * chapter diversity, deterministic commands, finite transforms, and bounded cost.
 */
export function runEnvironmentCases() {
	return [
		checkPresetCoverage(),
		checkChapterDiversity(),
		checkDeterministicCommands(),
		checkCommandValidity()
	];
}

function checkPresetCoverage() {
	const presets = LEVELS.map(environmentPreset);
	assert.equal(environmentThemeIds().length, 10);
	assert.ok(presets.every(validPreset));
	return { test: 'environment-presets', levels: presets.length, themes: environmentThemeIds().length };
}

function checkChapterDiversity() {
	const chapterPresets = LEVELS.filter(level => level.localIndex === 0).map(environmentPreset);
	const signatures = new Set(chapterPresets.map(preset => [
		...preset.clear,
		...preset.fog,
		preset.waterAmount,
		preset.ridgeHeight,
		preset.vegetationAmount
	].map(value => value.toFixed(4)).join(':')));
	assert.equal(signatures.size, 10);
	return { test: 'environment-chapter-diversity', signatures: signatures.size };
}

function checkDeterministicCommands() {
	const world = createWorld();
	const first = [];
	const second = [];
	const firstResult = environmentCommands(first, world, 2.5);
	const secondResult = environmentCommands(second, world, 2.5);
	assert.deepEqual(first, second);
	assert.equal(firstResult.commands, secondResult.commands);
	assert.ok(firstResult.commands <= firstResult.budget.maximumCommands);
	return { test: 'environment-determinism', commands: firstResult.commands, tier: firstResult.budget.tier };
}

function checkCommandValidity() {
	const world = createWorld();
	const commands = [];
	const result = environmentCommands(commands, world, 4.25);
	assert.ok(commands.some(command => command.mesh === 'shard' || command.mesh === 'sphere'));
	assert.ok(commands.some(command => command.mesh === 'disc'));
	assert.ok(commands.every(validCommand));
	return { test: 'environment-command-validity', commands: commands.length, limit: result.budget.maximumCommands };
}

function validPreset(preset) {
	const numbers = [
		...preset.clear,
		...preset.fog,
		...preset.sunColor,
		...preset.ambientColor,
		...preset.sunDirection,
		preset.waterAmount,
		preset.ridgeHeight,
		preset.vegetationAmount,
		preset.fogNear,
		preset.fogFarScale,
		preset.hazeHeight,
		preset.hazeStrength
	];
	return numbers.every(Number.isFinite) && preset.waterAmount >= 0 && preset.waterAmount <= 1;
}

function validCommand(command) {
	const values = [...command.pos, ...command.scale, command.rot, command.tilt || 0, command.alpha, command.glow];
	return values.every(Number.isFinite) && command.scale.every(value => value > 0) && command.alpha >= 0 && command.alpha <= 1;
}
