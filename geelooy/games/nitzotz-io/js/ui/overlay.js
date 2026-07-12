// B"H
import { LEVELS } from '../levels/catalog.js';
import { MODES } from '../modes/catalog.js';

export function bindOverlay(world, dom, actions) {
	dom.start.onclick = actions.primary;
	dom.restart.onclick = actions.restart;
	dom.pause.onclick = actions.pause;
	dom.modeCycle.onclick = () => world.mode !== 'paused' && actions.cycleMode();
	dom.levelSelect.onclick = event => chooseLevel(event, actions);
	dom.modeSelect.onclick = event => chooseMode(event, world, actions);
}

export function renderOverlay(world, dom) {
	const visible = world.mode !== 'playing';
	dom.overlay.classList.toggle('hidden', !visible);
	dom.pause.textContent = world.mode === 'paused' ? 'RESUME' : 'PAUSE';
	if (!visible) return;
	renderLevelSelect(world, dom);
	renderModeSelect(world, dom);
	if (world.mode === 'won') return renderWon(world, dom);
	if (world.mode === 'lost') return renderLost(world, dom);
	if (world.mode === 'paused') return renderPaused(world, dom);
	renderReady(world, dom);
}

function renderReady(world, dom) {
	dom.title.textContent = world.level.name;
	dom.text.textContent = `${world.gameMode.name}. ${world.level.objective}. Bonus: ${world.level.bonus.label}.`;
	dom.stars.textContent = starLine(world.save.stars[world.level.key] || 0);
	dom.start.textContent = 'ENTER DISTRICT';
	dom.restart.textContent = 'REGENERATE';
}

function renderPaused(world, dom) {
	dom.title.textContent = 'Arena Paused';
	dom.text.textContent = `${world.gameMode.name} remains suspended inside the persistent ${world.level.name}.`;
	dom.stars.textContent = starLine(world.save.stars[world.level.key] || 0);
	dom.start.textContent = 'RESUME';
	dom.restart.textContent = 'RESTART LEVEL';
}

function renderWon(world, dom) {
	dom.title.textContent = `${world.level.name} Revealed`;
	dom.text.textContent = `${world.gameMode.name}. Rank ${world.rank}. Mass ${Math.round(world.player.mass)}. Bosses ${world.telemetry.bosses}.`;
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

function renderLevelSelect(world, dom) {
	dom.levelSelect.innerHTML = LEVELS.map((level, index) => {
		const locked = index > world.save.unlocked;
		const stars = world.save.stars[level.key] || 0;
		const active = index === world.level.index ? ' active' : '';
		return `<button class="level-card${active}" data-level="${index}" ${locked ? 'disabled' : ''}><b>${index + 1}</b><span>${level.name}</span><em>${locked ? 'LOCKED' : starLine(stars)}</em></button>`;
	}).join('');
}

function chooseLevel(event, actions) {
	const button = event.target.closest('[data-level]');
	if (button && !button.disabled) actions.selectLevel(Number(button.dataset.level));
}

function chooseMode(event, world, actions) {
	const button = event.target.closest('[data-mode]');
	if (button && !button.disabled && world.mode !== 'paused') actions.selectMode(button.dataset.mode);
}

function starLine(count) {
	return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}
