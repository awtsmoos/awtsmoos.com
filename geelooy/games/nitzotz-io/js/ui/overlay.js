// B"H
// Boruch Hashem
// Blessed is He
import { renderAdventurePanel } from './adventure.js';
import { renderCampaign } from './campaign.js';
import { renderMultiplayerPanel } from './multiplayer.js';
import { renderOverlayContent } from './overlayContent.js';
import { renderQuests } from './quests.js';
import { renderShop } from './shop.js';

/**
 * The Awtsmoos opens deep systems only when motion yields to intention;
 * Awtsmoos.com keeps pause as one quiet icon while advanced campaign vessels remain one tap away.
 */
export function bindOverlay(world, dom, actions) {
	bindPress(dom.start, actions.primary);
	bindPress(dom.restart, actions.restart);
	bindPress(dom.pause, actions.pause);
	bindPress(dom.modeCycle, () => {
		if (world.mode !== 'paused') actions.cycleMode();
	});
	dom.chapterSelect.onclick = event => choose(event, '[data-chapter]', 'chapter', actions.selectChapter);
	dom.levelSelect.onclick = event => choose(event, '[data-level]', 'level', actions.selectLevel);
	dom.shopGrid.onclick = event => choose(event, '[data-upgrade]', 'upgrade', actions.buyUpgrade);
	dom.questList.onclick = event => choose(event, '[data-quest]', 'quest', actions.claimQuest);
	dom.modeSelect.onclick = event => chooseMode(event, world, actions);
}

/** Render expanded progression only while the arena is not actively moving. */
export function renderOverlay(world, dom) {
	const visible = world.mode !== 'playing';
	const paused = world.mode === 'paused';
	dom.overlay.classList.toggle('hidden', !visible);
	dom.pause.textContent = paused ? '▶' : 'Ⅱ';
	dom.pause.setAttribute('aria-label', paused ? 'Resume game' : 'Pause and open menu');
	dom.pause.title = paused ? 'Resume' : 'Pause';
	if (!visible) return;
	renderCampaign(world, dom);
	renderShop(world, dom);
	renderQuests(world, dom);
	renderAdventurePanel(world, dom);
	renderMultiplayerPanel(world, dom);
	renderOverlayContent(world, dom);
}

function bindPress(element, action) {
	let touchHandledAt = -Infinity;
	element.addEventListener('pointerup', event => {
		if (event.pointerType === 'mouse') return;
		event.preventDefault();
		touchHandledAt = performance.now();
		action();
	});
	element.addEventListener('click', () => {
		if (performance.now() - touchHandledAt < 500) return;
		action();
	});
}

function choose(event, selector, dataKey, action) {
	const button = event.target.closest(selector);
	if (!button || button.disabled) return;
	const raw = button.dataset[dataKey];
	action(dataKey === 'level' || dataKey === 'chapter' ? Number(raw) : raw);
}

function chooseMode(event, world, actions) {
	if (world.mode === 'paused') return;
	choose(event, '[data-mode]', 'mode', actions.selectMode);
}
