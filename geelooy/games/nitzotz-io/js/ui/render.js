// B"H
// Boruch Hashem
// Blessed is He
import { bossText } from '../director/boss.js';
import { statsText } from '../engine/stats.js';
import { bonusProgress } from '../game/progression.js';
import { renderLeaderboard } from './leaderboard.js';
import { drawMap } from './minimap.js';
import { renderOverlay } from './overlay.js';
import { renderToggles } from './toggles.js';

/** Awtsmoos.com reveals one world through measured, readable interface vessels. */
export function renderUI(world, dom, options = {}) {
	const progress = bonusProgress(world);
	document.body.dataset.mode = world.mode;
	dom.progress.value = Math.min(1, world.player.mass / world.level.targetMass);
	dom.mass.textContent = Math.round(world.player.mass);
	dom.time.textContent = Number.isFinite(world.timeLeft) ? Math.max(0, Math.ceil(world.timeLeft)) : '∞';
	dom.rank.textContent = `${world.rank}/${world.rivals.length + 1}`;
	dom.combo.textContent = `x${world.player.combo.toFixed(1)}`;
	dom.best.textContent = Math.round(world.save.bestMass || 0);
	dom.sparkHud.textContent = world.save.sparks || 0;
	dom.level.textContent = `District ${world.level.index + 1}: ${world.level.name}`;
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
	if (options.drawMinimap) drawMap(dom.map, world);
}

function renderDirector(world, dom) {
	const activeEvent = world.director.event;
	const strongest = strongestRival(world.rivals);
	dom.mode.textContent = world.gameMode.name;
	dom.event.textContent = activeEvent ? `${activeEvent.name} · ${Math.ceil(world.director.eventTime)}s` : 'CITY QUIET';
	dom.event.classList.toggle('active', Boolean(activeEvent));
	dom.boss.textContent = bossText(world);
	dom.boss.classList.toggle('active', world.director.boss.status !== 'dormant');
	dom.rival.textContent = strongest ? `${strongest.name} · ${strongest.archetype.name}` : 'NO RIVALS';
	const count = Object.keys(world.save.achievements).length;
	dom.achievement.textContent = `${count} ACHIEVEMENT${count === 1 ? '' : 'S'}`;
}

function strongestRival(rivals) {
	let strongest = null;
	for (const rival of rivals) {
		if (!strongest || rival.mass > strongest.mass) strongest = rival;
	}
	return strongest;
}

function powerText(world) {
	const powers = [];
	if (world.powerups.magnet > 0) powers.push(`MAGNET ${Math.ceil(world.powerups.magnet)}s`);
	if (world.powerups.surge > 0) powers.push(`SURGE ${Math.ceil(world.powerups.surge)}s`);
	return powers.join(' · ') || 'NO ACTIVE POWER';
}

function districtText(world) {
	return world.districtChain > 1
		? `${world.lastDistrict} CHAIN ×${world.districtChain}`
		: 'BUILD A DISTRICT CHAIN';
}
