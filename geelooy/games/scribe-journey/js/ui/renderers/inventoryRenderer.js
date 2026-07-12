// B"H

const EMPTY_SATCHEL = '<p class="empty-state">Your satchel is empty.</p>';

function canUseItem(item) {
	return item.type === 'consumable' || item.type === 'tome' || item.type === 'kli';
}

/** Renders satchel entries as semantic controls without inline script. */
export function renderInventory(items = []) {
	if (items.length === 0) return EMPTY_SATCHEL;
	return items.map(item => `
		<article class="inventory-item ${item.isQuestItem ? 'quest-item' : ''} rarity-${item.rarity || 'common'}">
			<div class="item-row">
				<strong>${item.name} ${item.isQuestItem ? '(QUEST)' : ''}</strong>
				${canUseItem(item) ? `<button class="menu-button compact-button" data-action="use_item" data-id="${item.id}">Use</button>` : ''}
			</div>
			<p class="muted-copy">${item.description}</p>
		</article>`).join('');
}
