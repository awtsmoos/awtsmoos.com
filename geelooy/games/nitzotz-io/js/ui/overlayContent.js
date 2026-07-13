// B"H
// Boruch Hashem
// Blessed is He
import { LEVELS } from '../levels/catalog.js';
import { MODES } from '../modes/catalog.js';

/** Awtsmoos.com gives each overlay state a bounded and readable voice. */
export function renderOverlayContent(world, dom) {
	renderModeSelect(world, dom);
	if (world.mode === 'won') return renderWon(world, dom);
	if (world.mode === 'lost') return renderLost(world, dom);
	if (world.mode === 'paused') return renderPaused(world, dom);
	renderReady(world, dom);
}

function renderReady(world, dom) {
	dom.title.textContent = world.level.name;
	dom.text.textContent = `${world.gameMode.name}. ${world.level.objective}. Bonus: ${world.level.bonus.label}. Mastery: ${world.level.mastery.label}.`;
	dom.stars.textContent = starLine(world.save.stars[world.level.key] || 0);
	dom.start.textContent = 'ENTER DISTRICT';
	dom.restart.textContent = 'REGENERATE';
}

function renderPaused(world, dom) {
	dom.title.textContent = 'Arena Paused';
	dom.text.textContent = `${world.gameMode.name} remains suspended inside ${world.level.name}.`;
	dom.stars.textContent = starLine(world.save.stars[world.level.key] || 0);
	dom.start.textContent = 'RESUME';
	dom.restart.textContent = 'RESTART LEVEL';
}

function renderWon(world, dom) {
	const reward = world.lastReward?.sparks ? ` ${world.lastReward.sparks} sparks returned.` : '';
	dom.title.textContent = `${world.level.name} Revealed`;
	dom.text.textContent = `${world.gameMode.name}. Rank ${world.rank}. Mass ${Math.round(world.player.mass)}.${reward}`;
	dom.stars.textContent = starLine(world.stars);
	dom.start.textContent = world.level.index >= LEVELS.length - 1 ? 'PLAY AGAIN' : 'NEXT DISTRICT';
	dom.restart.textContent = 'REPLAY';
}

function renderLost(world, dom) {
	dom.title.textContent = 'The Round Closed';
	dom.text.textContent = `${world.gameMode.name}: mass ${Math.round(world.player.mass)} / ${world.level.targetMass}. Change routes or modes and return.`;
	dom.stars.textContent = starLine(0);
	dom.start.textContent = 'RETRY';
	dom.restart.textContent = 'REGENERATE';
}

function renderModeSelect(world, dom) {
	const locked = world.mode === 'paused';
	dom.modeDescription.textContent = `${world.gameMode.name} · ${world.gameMode.description}`;
	dom.modeCycle.disabled = locked;
	dom.modeSelect.innerHTML = MODES.map(mode => modeCard(mode, world, locked)).join('');
}

function modeCard(mode, world, locked) {
	const active = mode.id === world.gameMode.id ? ' active' : '';
	const record = world.save.modeRecords[mode.id];
	const result = record ? `${record.wins || 0} WINS · ${record.bestScore || 0} BEST` : 'NEW PATH';
	return `<button class="mode-card${active}" data-mode="${mode.id}" ${locked ? 'disabled' : ''}><b>${mode.name}</b><span>${mode.description}</span><em>${result}</em></button>`;
}

function starLine(count) {
	return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}
