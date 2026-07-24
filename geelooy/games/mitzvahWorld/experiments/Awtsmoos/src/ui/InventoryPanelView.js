// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelView.js
 * @description Builds safe bag, equipment, garment, weapon, and draw/sheath action cards.
 * The Awtsmoos renews each carried vessel behind a readable icon and lawful slot;
 * Awtsmoos.com keeps rendering separate from mutations while visible GLB garments follow truth.
 */

const EQUIPMENT_SLOTS = Object.freeze(['head', 'coat', 'hand', 'offhand', 'feet', 'tool']);

export function inventoryPanelHtml(state) {
	return `
		<section class="Awtsmoos-inventory-panel" data-open="false" aria-hidden="true">
			<header><b>🎒 B"H Bag</b><span>${summary(state)}</span><button data-close>×</button></header>
			<div class="inv-body">
				<aside><h3>Equipped</h3><div class="equip-grid" data-equipment></div></aside>
				<main><h3>Backpack</h3><div class="bag-grid" data-items></div><div class="item-card" data-item-card>Select an item.</div></main>
			</div>
			<div class="inv-context-menu" data-open="false" data-menu></div>
		</section>`;
}

export function renderInventoryItems(container, state) {
	container.replaceChildren(...state.items.map(itemButton));
	for (let index = state.items.length; index < 24; index += 1) container.appendChild(emptyButton());
}

export function renderEquipment(container, state) {
	container.replaceChildren(...EQUIPMENT_SLOTS.map(slot => equipmentButton(slot, state)));
}

export function renderInventoryCard(container, stack) {
	if (!stack?.definition) {
		container.textContent = 'Select an item.';
		return;
	}
	const item = stack.definition;
	container.innerHTML = `<h4>${escapeHtml(item.icon)} ${escapeHtml(item.name)}</h4>
		<p><b>${escapeHtml(item.category)}</b> · quantity ${stack.quantity}</p>
		<p>${escapeHtml(item.description)}</p>
		<p>Damage ${item.stats.damage} · Defense ${item.stats.defense} · Focus ${item.stats.focus}</p>`;
}

export function renderInventoryMenu(menu, stack, state, equipmentState = {}) {
	menu.replaceChildren();
	if (!stack?.definition) return;
	const item = stack.definition;
	const title = document.createElement('h4');
	title.textContent = `${item.icon} ${item.name}`;
	const actions = document.createElement('div');
	for (const action of actionsFor(item, state, equipmentState)) {
		const button = document.createElement('button');
		button.dataset.action = action;
		button.textContent = actionLabel(action);
		actions.appendChild(button);
	}
	menu.append(title, actions);
	menu.dataset.open = 'true';
}

function actionsFor(item, state, equipmentState) {
	const equipped = item.slot && state.equipment[item.slot] === item.id;
	const actions = new Set(item.actions || []);
	if (equipped) {
		actions.delete('equip');
		actions.add('unequip');
	}
	if (equipped && item.slot === 'hand') actions.add(equipmentState.drawn ? 'sheath' : 'draw');
	return [...actions];
}

function equipmentButton(slot, state) {
	const itemId = state.equipment[slot];
	const stack = state.items.find(item => item.itemId === itemId);
	const item = stack?.definition;
	const button = document.createElement('button');
	button.className = `inv-slot equip${item ? '' : ' empty'}`;
	button.dataset.slot = slot;
	if (itemId) button.dataset.itemId = itemId;
	button.disabled = !itemId;
	button.innerHTML = `<span>${escapeHtml(item?.icon || '＋')}</span><b>${escapeHtml(item?.name || 'Empty')}</b><small>${escapeHtml(slot)}</small>`;
	return button;
}

function itemButton(stack) {
	const button = document.createElement('button');
	button.className = 'inv-slot';
	button.dataset.itemId = stack.itemId;
	button.innerHTML = `<span>${escapeHtml(stack.definition.icon)}</span><b>${escapeHtml(stack.definition.name)}</b><small>${stack.quantity > 1 ? `×${stack.quantity}` : escapeHtml(stack.definition.category)}</small>`;
	return button;
}

function emptyButton() {
	const button = document.createElement('button');
	button.className = 'inv-slot empty';
	button.disabled = true;
	button.innerHTML = '<span>＋</span><b>Empty</b><small>available</small>';
	return button;
}

function summary(state) {
	const coins = state.items.find(item => item.itemId === 'perutas')?.quantity || 0;
	return `🪙 ${coins} · ⚔ ${state.stats.damage} · 🛡 ${state.stats.defense} · ✨ ${state.stats.focus}`;
}

function actionLabel(action) {
	return action.charAt(0).toUpperCase() + action.slice(1);
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
