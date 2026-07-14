// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPanelView.js
 * @description Builds safe inventory cards for stacks, equipment, statistics, and actions.
 * The Awtsmoos renews each carried vessel behind a readable icon and lawful slot;
 * Awtsmoos.com keeps rendering separate from store mutations and server authority.
 */

export function inventoryPanelHtml(state) {
	return `
		<section class="Awtsmoos-inventory-panel" data-open="false" aria-hidden="true">
			<header>
				<b>🎒 B"H Bag</b>
				<span>🪙 ${quantity(state, 'perutas')} · ⚔ ${state.stats.damage} · 🛡 ${state.stats.defense} · ✨ ${state.stats.focus}</span>
				<button data-close aria-label="Close bag">×</button>
			</header>
			<div class="inv-body">
				<aside><h3>Equipped</h3><div class="equip-grid" data-equipment></div></aside>
				<main><h3>Backpack</h3><div class="bag-grid" data-items></div><div class="item-card" data-item-card>Select an item.</div></main>
			</div>
			<div class="inv-context-menu" data-open="false" data-menu></div>
		</section>
	`;
}

export function renderInventoryItems(container, state) {
	container.replaceChildren(...state.items.map(stack => itemButton(stack)));
	const emptyCount = Math.max(0, 24 - state.items.length);
	for (let index = 0; index < emptyCount; index += 1) {
		container.appendChild(emptyButton());
	}
}

export function renderEquipment(container, state) {
	container.replaceChildren(...Object.entries(state.equipment).map(([slot, itemId]) => {
		const stack = state.items.find(item => item.itemId === itemId);
		const definition = stack?.definition;
		const button = document.createElement('button');
		button.className = 'inv-slot equip';
		button.dataset.itemId = itemId;
		button.dataset.slot = slot;
		button.innerHTML = `<span>${escapeHtml(definition?.icon || '✨')}</span><b>${escapeHtml(definition?.name || itemId)}</b><small>${escapeHtml(slot)}</small>`;
		return button;
	}));
}

export function renderInventoryCard(container, stack) {
	if (!stack?.definition) {
		container.textContent = 'Select an item.';
		return;
	}
	const definition = stack.definition;
	container.innerHTML = `
		<h4>${escapeHtml(definition.icon)} ${escapeHtml(definition.name)}</h4>
		<p><b>${escapeHtml(definition.category)}</b> · quantity ${stack.quantity}</p>
		<p>${escapeHtml(definition.description)}</p>
		<p>Damage ${definition.stats.damage} · Defense ${definition.stats.defense} · Focus ${definition.stats.focus}</p>
	`;
}

export function renderInventoryMenu(menu, stack) {
	menu.replaceChildren();
	if (!stack?.definition) return;
	const title = document.createElement('h4');
	title.textContent = `${stack.definition.icon} ${stack.definition.name}`;
	const actions = document.createElement('div');
	for (const action of stack.definition.actions) {
		const button = document.createElement('button');
		button.dataset.action = action;
		button.textContent = actionLabel(action);
		actions.appendChild(button);
	}
	menu.append(title, actions);
	menu.dataset.open = 'true';
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

function quantity(state, itemId) {
	return state.items.find(item => item.itemId === itemId)?.quantity || 0;
}

function actionLabel(action) {
	return action.charAt(0).toUpperCase() + action.slice(1);
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
