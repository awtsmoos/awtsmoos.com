// B"H
import { bossText } from '../director/boss.js';
import { statsText } from '../engine/stats.js';
import { bonusProgress } from '../game/progression.js';
import { drawMap } from './minimap.js';
import { renderLeaderboard } from './leaderboard.js';
import { renderOverlay } from './overlay.js';
import { renderToggles } from './toggles.js';

/** Render mission, rules, event, boss, rival, records, overlay, and minimap. */
export function renderUI(world, dom) {
	const progress = bonusProgress(world);
	document.body.dataset.mode = world.mode;
	dom.progress.value = Math.min(1, world.player.mass / world.level.targetMass);
	dom.mass.textContent = Math.round(world.player.mass);
	dom.time.textContent = Number.isFinite(world.timeLeft) ? Math.max(0, Math.ceil(world.timeLeft)) : '∞';
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
	dom.district.textContent = districtText(world);
	renderDirector(world, dom);
	dom.message.textContent = `${world.message}${statsText(world)}`;
	renderLeaderboard(world, dom.leaderboard);
	renderOverlay(world, dom);
	renderToggles(world, dom);
	if (world.performance.frame % world.performance.mapEvery === 0) drawMap(dom.map, world);
}

function renderDirector(world, dom) {
	const activeEvent = world.director.event;
	const strongest = [...world.rivals].sort((left, right) => right.mass - left.mass)[0];
	dom.mode.textContent = world.gameMode.name;
	dom.event.textContent = activeEvent ? `${activeEvent.name} · ${Math.ceil(world.director.eventTime)}s` : 'CITY QUIET';
	dom.event.classList.toggle('active', Boolean(activeEvent));
	dom.boss.textContent = bossText(world);
	dom.boss.classList.toggle('active', world.director.boss.status !== 'dormant');
	dom.rival.textContent = strongest ? `${strongest.name} · ${strongest.archetype.name}` : 'NO RIVALS';
	const count = Object.keys(world.save.achievements).length;
	dom.achievement.textContent = `${count} ACHIEVEMENT${count === 1 ? '' : 'S'}`;
}

function powerText(world) {
	const powers = [];
	if (world.powerups.magnet > 0) powers.push(`MAGNET ${Math.ceil(world.powerups.magnet)}s`);
	if (world.powerups.surge > 0) powers.push(`SURGE ${Math.ceil(world.powerups.surge)}s`);
	return powers.join(' · ') || 'NO ACTIVE POWER';
}

function districtText(world) {
	return world.districtChain > 1 ? `${world.lastDistrict} CHAIN ×${world.districtChain}` : 'BUILD A DISTRICT CHAIN';
}
