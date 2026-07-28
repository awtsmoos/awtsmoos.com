// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootStyles.js
 * @description Styles mobile-safe manual corpse loot with canonical rarity and value accents.
 * The Awtsmoos gives each recovered vessel a visible name before it changes hands;
 * Awtsmoos.com makes rarity, value, Take, Loot All, and leaving readable without accidental drag.
 */

export const MINIMAL_MEADOW_CORPSE_LOOT_CSS = `
html[data-awtsmoos-loot-modal-open="true"] #joy,
html[data-awtsmoos-loot-modal-open="true"] #jump,
html[data-awtsmoos-loot-modal-open="true"] .Awtsmoos-action-host,
html[data-awtsmoos-loot-modal-open="true"] .Awtsmoos-game-rail {
	visibility: hidden !important; pointer-events: none !important;
}
.Awtsmoos-corpse-loot-backdrop {
	position: fixed; inset: 0; z-index: 985; display: grid; place-items: center;
	padding: max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom));
	background: radial-gradient(circle at 50% 42%, rgba(56,38,17,.28), rgba(1,5,7,.84));
	backdrop-filter: blur(8px); pointer-events: auto;
}
.Awtsmoos-corpse-loot-backdrop[hidden] { display: none; }
.Awtsmoos-corpse-loot-panel {
	width: min(560px, 96vw); max-height: min(82dvh, 720px); overflow: auto;
	border: 2px solid #c9953f; border-radius: 22px;
	background: linear-gradient(155deg, rgba(16,28,28,.99), rgba(5,11,15,.99));
	color: #f7f0df; box-shadow: 0 30px 90px rgba(0,0,0,.68), inset 0 1px rgba(255,255,255,.08);
	font: 14px/1.35 system-ui;
}
.loot-panel-header {
	position: sticky; top: 0; z-index: 2; display: grid; grid-template-columns: 52px 1fr 48px;
	align-items: center; gap: 10px; padding: 15px; border-bottom: 1px solid rgba(220,177,88,.28);
	background: rgba(7,16,18,.98);
}
.loot-panel-header > span { font-size: 34px; }
.loot-panel-header h2 { margin: 0; color: #ffe0a0; font: 900 24px/1.05 Georgia, serif; }
.loot-panel-header small { color: #a8cabe; }
.loot-close {
	width: 46px; height: 46px; border: 1px solid #9e573f; border-radius: 12px;
	background: #3e1716; color: #ffd9c5; font-size: 24px;
}
.loot-story { margin: 0; padding: 12px 16px; color: #c8d6d1; border-bottom: 1px solid rgba(255,255,255,.07); }
.loot-item-list { display: grid; gap: 10px; padding: 14px; }
.loot-item-row {
	display: grid; grid-template-columns: 54px 1fr auto; gap: 12px; align-items: center;
	padding: 12px; border: 1px solid color-mix(in srgb, var(--loot-rarity) 68%, #20312f);
	border-left: 5px solid var(--loot-rarity); border-radius: 15px;
	background: linear-gradient(145deg, rgba(23,42,37,.95), rgba(12,23,24,.95));
	box-shadow: inset 0 0 18px color-mix(in srgb, var(--loot-rarity) 12%, transparent);
}
.loot-item-icon {
	display: grid; place-items: center; width: 52px; height: 52px;
	border: 1px solid var(--loot-rarity); border-radius: 12px; background: #21180d; font-size: 30px;
}
.loot-item-name b { display: block; color: var(--loot-rarity); font-size: 16px; }
.loot-item-name small { display: block; color: #a9beb8; }
.loot-item-name em { display: block; color: #dacda8; font-size: 12px; font-style: normal; }
.loot-take {
	min-width: 94px; min-height: 46px; padding: 8px 13px; border: 1px solid #e5c56d;
	border-radius: 11px; background: linear-gradient(180deg, #3f8053, #225139); color: white;
	font-weight: 900;
}
.loot-panel-footer {
	position: sticky; bottom: 0; display: flex; justify-content: space-between; gap: 10px;
	padding: 14px; border-top: 1px solid rgba(220,177,88,.28); background: rgba(7,16,18,.98);
}
.loot-panel-footer button { min-height: 50px; padding: 10px 18px; border-radius: 12px; font-weight: 900; }
.loot-leave { border: 1px solid #596f68; background: #172421; color: #d7e3df; }
.loot-all { border: 1px solid #f2d174; background: linear-gradient(180deg, #8a5c1d, #54330f); color: #fff1bd; }
@media (max-width: 560px) {
	.Awtsmoos-corpse-loot-backdrop { place-items: end center; padding-inline: 0; padding-bottom: 0; }
	.Awtsmoos-corpse-loot-panel { width: 100%; max-height: 72dvh; border-radius: 20px 20px 0 0; }
	.loot-item-row { grid-template-columns: 48px 1fr; }
	.loot-item-icon { width: 46px; height: 46px; }
	.loot-take { grid-column: 1 / -1; width: 100%; }
	.loot-panel-footer button { flex: 1; }
}
`;

export function installMinimalMeadowCorpseLootStyles(documentValue) {
	const id = 'Awtsmoos-minimal-meadow-corpse-loot-styles';
	if (documentValue.getElementById(id)) return;
	const style = documentValue.createElement('style');
	style.id = id;
	style.textContent = MINIMAL_MEADOW_CORPSE_LOOT_CSS;
	documentValue.head.append(style);
}
