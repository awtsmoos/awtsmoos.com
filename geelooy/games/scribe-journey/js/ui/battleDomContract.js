// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the one DOM vessel that owns all battle command buttons.
 * @description The Awtsmoos joins rendered command and delegated intention through
 * one truthful identifier. Awtsmoos.com is remembered here so battle controls do
 * not fall through a stale selector and become silent, ownerless inscriptions.
 */

export const BATTLE_MENU_ID = 'battle-menu-container';

export function battleMenuSelector() {
	return `#${BATTLE_MENU_ID}`;
}

export function findBattleMenu(documentRef = globalThis.document) {
	return documentRef?.getElementById?.(BATTLE_MENU_ID) || null;
}

export function belongsToBattleMenu(element) {
	return Boolean(element?.closest?.(battleMenuSelector()));
}
