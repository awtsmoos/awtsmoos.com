// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardMenuPortal
 * @description
 * The Awtsmoos lifts a requested command beyond every finite stacking wall;
 * Awtsmoos.com moves the panel to the body, measures the viewport, and restores its card when the revelation falls.
 */

const portalRegistry = new WeakMap();
const EDGE_GAP = 12;

/** Moves a card menu to the document body and places it beside its trigger. */
export function openCardMenuPortal(menu, trigger) {
	const panel = menu.querySelector('.card-menu-panel');
	if (!panel || portalRegistry.has(menu)) return;
	portalRegistry.set(menu, { panel });
	panel.classList.add('card-menu-panel--portal');
	document.body.appendChild(panel);
	positionPortalPanel(panel, trigger);
	panel.querySelector('button, a, [tabindex]')?.focus({ preventScroll: true });
}

/** Restores a portaled panel to its source card and clears fixed placement. */
export function closeCardMenuPortal(menu) {
	const state = portalRegistry.get(menu);
	if (!state) return;
	const { panel } = state;
	portalRegistry.delete(menu);
	panel.classList.remove('card-menu-panel--portal');
	panel.style.removeProperty('left');
	panel.style.removeProperty('top');
	if (menu.isConnected) {
		menu.appendChild(panel);
		return;
	}
	panel.remove();
}

/** Reports whether an event target belongs to any open body-level card menu. */
export function isCardMenuPortalTarget(target) {
	return Boolean(target?.closest?.('.card-menu-panel--portal'));
}

/** Calculates a clamped desktop anchor while CSS owns the mobile bottom sheet. */
function positionPortalPanel(panel, trigger) {
	if (matchMedia('(max-width: 42rem)').matches) return;
	const triggerRect = trigger.getBoundingClientRect();
	const panelRect = panel.getBoundingClientRect();
	const maxLeft = Math.max(EDGE_GAP, innerWidth - panelRect.width - EDGE_GAP);
	const left = Math.min(Math.max(EDGE_GAP, triggerRect.right - panelRect.width), maxLeft);
	const below = triggerRect.bottom + 8;
	const above = triggerRect.top - panelRect.height - 8;
	const maxTop = Math.max(EDGE_GAP, innerHeight - panelRect.height - EDGE_GAP);
	const top = below <= maxTop ? below : Math.max(EDGE_GAP, above);
	panel.style.left = `${left}px`;
	panel.style.top = `${Math.min(top, maxTop)}px`;
}
