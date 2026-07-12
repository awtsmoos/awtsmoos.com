// B"H
import { statsText } from '../engine/stats.js';
import { bonusProgress } from '../game/progression.js';
import { drawMap } from './minimap.js';
import { renderLeaderboard } from './leaderboard.js';
import { renderOverlay } from './overlay.js';
import { renderToggles } from './toggles.js';

/** Render mass, rank, mission, bonus, powers, chains, overlay, and minimap. */
export function renderUI(world, dom) {
	const progress = bonusProgress(world);
	document.body.dataset.mode = world.mode;
	dom.progress.value = Math.min(1, world.player.mass / world.level.targetMass);
	dom.mass.textContent = Math.round(world.player.mass);
	dom.time.textContent = Math.max(0, Math.ceil(world.timeLeft));
	dom.rank.textContent = `${world.rank}/${world.rivals.length + 1}`;
	dom.combo.textContent = `x${world.player.combo.toFixed(1)}`;
	dom.best.textContent = Math.round(world.save.bestMass || 0);
	dom.level.textContent = `Level ${world.level.index + 1}: ${world.level.name}`;
	dom.sefirah.textContent = world.level.sefirah;
	dom.objective.textContent = world.level.objective;
	dom.progressText.textContent = `${Math.round(world.player.mass)} / ${world.level.targetMass}`;
	dom.bonus.textContent = world.level.bonus.label;
	dom.bonusProgress.textContent = `${progress} / ${world.level.bonus.target}`;
	dom.power.textContent = powerText(world);
	dom.district.textContent = world.districtChain > 1 ? `${world.lastDistrict} CHAIN ×${world.districtChain}` : 'BUILD A DISTRICT CHAIN';
	dom.message.textContent = `${world.message}${statsText(world)}`;
	renderLeaderboard(world, dom.leaderboard);
	renderOverlay(world, dom);
	renderToggles(world, dom);
	if (world.performance.frame % world.performance.mapEvery === 0) drawMap(dom.map, world);
}

function powerText(world) {
	const powers = [];
	if (world.powerups.magnet > 0) powers.push(`MAGNET ${Math.ceil(world.powerups.magnet)}s`);
	if (world.powerups.surge > 0) powers.push(`SURGE ${Math.ceil(world.powerups.surge)}s`);
	return powers.join(' · ') || 'NO ACTIVE POWER';
}
