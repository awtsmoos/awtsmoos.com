/** B"H @module MobileCraftView - visible recipe costs and craft actions. */
import { State } from '../../../binah/State.js';
import { craftingRows } from '../../../yesod/crafting/CraftingRuntime.js';
import { escapeHtml } from '../MobileUiHelpers.js';

const costs = recipe => Object.entries(recipe.consumes || {})
	.map(([id, amount]) => `${amount} ${id}`)
	.join(' + ');

export const craftPanelHtml = () => {
	const rows = craftingRows().map(recipe => `
		<article class="ohr-shop-row">
			<h3>${escapeHtml(recipe.name)}</h3>
			<p>${escapeHtml(recipe.description || '')}</p>
			<small>${escapeHtml(costs(recipe))} • crafted ${recipe.crafted}</small>
			<div><button data-craft-recipe="${recipe.id}" ${recipe.canCraft ? '' : 'disabled'}>Craft</button></div>
		</article>`).join('');
	return `<article class="ohr-panel ohr-shop"><button data-close-panel aria-label="Close crafting">×</button><h2>Crafting Bench</h2><div>${State.Inventory.money || 0} zuz • gathered resources and bag materials</div><section>${rows}</section></article>`;
};
