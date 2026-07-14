// B"H
// Boruch Hashem
// Blessed is He
import { adventureMetric, adventureProgress } from './metrics.js';
import { currentAdventureStep } from './state.js';

/**
 * The Awtsmoos advances one bounded Shlichus stage from truth already present in
 * the world. No separate mission simulation or object search is introduced.
 */
export function updateAdventure(world) {
	const adventure = world.adventure;
	const step = currentAdventureStep(adventure);
	if (!step || world.mode !== 'playing') return;
	step.progress = Math.min(step.target, adventureProgress(world, step));
	if (step.progress < step.target) return;
	completeStage(world, step);
}

/** Produce one compact live HUD summary. */
export function adventureSummary(world) {
	const adventure = world.adventure;
	if (!adventure?.active) return 'ARENA PATH';
	if (adventure.complete) return `SHLICHUS COMPLETE · +${adventure.pendingPerutot}₽`;
	const step = currentAdventureStep(adventure);
	return `${adventure.currentIndex + 1}/3 ${step.name} · ${Math.floor(step.progress)}/${step.target}`;
}

/** Produce complete stage views for the paused overlay. */
export function adventureViews(world) {
	return (world.adventure?.steps || []).map((step, index) => ({
		...step,
		index,
		active: index === world.adventure.currentIndex && !world.adventure.complete
	}));
}

function completeStage(world, step) {
	step.complete = true;
	step.progress = step.target;
	const reward = Math.round(step.reward * (world.talentEffects?.perutahScale || 1));
	world.adventure.pendingPerutot += reward;
	world.adventure.stageCompletions += 1;
	world.adventure.currentIndex += 1;
	world.events.push(['shlichus', world.adventure.currentIndex]);
	if (world.adventure.currentIndex >= world.adventure.steps.length) {
		world.adventure.complete = true;
		world.message = `Shlichus complete. ${world.adventure.pendingPerutot} perutot await settlement.`;
		return;
	}
	const next = world.adventure.steps[world.adventure.currentIndex];
	next.baseline = adventureMetric(world, next);
	world.message = `${step.name} complete. Next: ${next.name}.`;
}
