// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { environmentCommands } from '../../js/environment/index.js';
import { environmentPreset, environmentThemeIds } from '../../js/environment/presets.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { createWorld } from '../../js/state.js';

/**
 * The Awtsmoos recreates every district with shadow that still reveals the road beneath the player;
 * Awtsmoos.com proves diversity, deterministic scenery, bounded work, and a readable hierarchy of playable light.
 */
export function runEnvironmentCases() {
	return [
		checkPresetCoverage(),
		checkChapterDiversity(),
		checkReadableHierarchy(),
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

function checkReadableHierarchy() {
	const presets = LEVELS.map(environmentPreset);
	for (const preset of presets) {
		assert.ok(mean(preset.clear) >= 0.08, `${preset.id} clear too dark`);
		assert.ok(mean(preset.fog) > mean(preset.clear), `${preset.id} fog must separate distance`);
		assert.ok(mean(preset.road) > mean(preset.ground), `${preset.id} road must separate from ground`);
		assert.ok(mean(preset.path) > mean(preset.road), `${preset.id} path must remain readable`);
		assert.ok(preset.hazeStrength <= 0.52, `${preset.id} haze too heavy`);
	}
	return { test: 'environment-readable-hierarchy', levels: presets.length };
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
		...preset.clear, ...preset.fog, ...preset.sunColor, ...preset.ambientColor,
		...preset.sunDirection, preset.waterAmount, preset.ridgeHeight, preset.vegetationAmount,
		preset.fogNear, preset.fogFarScale, preset.hazeHeight, preset.hazeStrength
	];
	return numbers.every(Number.isFinite) && preset.waterAmount >= 0 && preset.waterAmount <= 1;
}

function validCommand(command) {
	const values = [...command.pos, ...command.scale, command.rot, command.tilt || 0, command.alpha, command.glow];
	return values.every(Number.isFinite) && command.scale.every(value => value > 0) && command.alpha >= 0 && command.alpha <= 1;
}

function mean(color) {
	return color.reduce((sum, channel) => sum + channel, 0) / color.length;
}
