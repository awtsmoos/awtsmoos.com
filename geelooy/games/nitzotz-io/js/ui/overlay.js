// B"H
import { LEVELS } from '../levels/catalog.js';

export function bindOverlay(world, dom, actions) {
	dom.start.onclick = actions.primary;
	dom.restart.onclick = actions.restart;
	dom.pause.onclick = actions.pause;
	dom.levelSelect.onclick = event => {
		const button = event.target.closest('[data-level]');
		if (button && !button.disabled) actions.selectLevel(Number(button.dataset.level));
	};
}

export function renderOverlay(world, dom) {
	const visible = world.mode !== 'playing';
	dom.overlay.classList.toggle('hidden', !visible);
	dom.pause.textContent = world.mode === 'paused' ? 'RESUME' : 'PAUSE';
	if (!visible) return;
	renderLevelSelect(world, dom);
	if (world.mode === 'won') return renderWon(world, dom);
	if (world.mode === 'lost') return renderLost(world, dom);
	if (world.mode === 'paused') return renderPaused(world, dom);
	renderReady(world, dom);
}

function renderReady(world, dom) {
	dom.title.textContent = world.level.name;
	dom.text.textContent = `${world.level.objective}. Bonus: ${world.level.bonus.label}. ${world.rivals.length} rival holes and moving traffic await.`;
	dom.stars.textContent = starLine(world.save.stars[world.level.key] || 0);
	dom.start.textContent = 'ENTER DISTRICT';
	dom.restart.textContent = 'REGENERATE';
}

function renderPaused(world, dom) {
	dom.title.textContent = 'Arena Paused';
	dom.text.textContent = `${world.level.name} remains persistent. Resume when ready.`;
	dom.stars.textContent = starLine(world.save.stars[world.level.key] || 0);
	dom.start.textContent = 'RESUME';
	dom.restart.textContent = 'RESTART LEVEL';
}

function renderWon(world, dom) {
	dom.title.textContent = `${world.level.name} Revealed`;
	dom.text.textContent = `Rank ${world.rank}. Bonus ${world.bonusMet ? 'complete' : 'missed'}. Mass ${Math.round(world.player.mass)}.`;
	dom.stars.textContent = starLine(world.stars);
	dom.start.textContent = world.level.index >= LEVELS.length - 1 ? 'PLAY AGAIN' : 'NEXT DISTRICT';
	dom.restart.textContent = 'REPLAY';
}

function renderLost(world, dom) {
	dom.title.textContent = 'The Clock Closed';
	dom.text.textContent = `Mass ${Math.round(world.player.mass)} / ${world.level.targetMass}. Use traffic, chains, and powerups more aggressively.`;
	dom.stars.textContent = starLine(0);
	dom.start.textContent = 'RETRY';
	dom.restart.textContent = 'REGENERATE';
}

function renderLevelSelect(world, dom) {
	dom.levelSelect.innerHTML = LEVELS.map((level, index) => {
		const locked = index > world.save.unlocked;
		const stars = world.save.stars[level.key] || 0;
		const active = index === world.level.index ? ' active' : '';
		return `<button class="level-card${active}" data-level="${index}" ${locked ? 'disabled' : ''}><b>${index + 1}</b><span>${level.name}</span><em>${locked ? 'LOCKED' : starLine(stars)}</em></button>`;
	}).join('');
}

function starLine(count) {
	return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}
