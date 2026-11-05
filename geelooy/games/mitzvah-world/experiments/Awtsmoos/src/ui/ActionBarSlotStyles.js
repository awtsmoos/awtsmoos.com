// B"H
// Boruch Hashem
// Blessed is He

/** @file ActionBarSlotStyles.js @description Ability slot, cooldown, charge, and state CSS. */

export const ACTION_BAR_SLOT_CSS = `
.Mitzvah-action-slot {
	--ability-a: #527d79;
	--ability-b: #142a2c;
	aspect-ratio: 1;
	background:
		linear-gradient(145deg, rgba(255, 255, 255, .16), transparent 34%),
		radial-gradient(circle at 50% 42%, var(--ability-a), var(--ability-b) 72%);
	border: 1px solid rgba(231, 198, 119, .62);
	border-radius: 8px;
	box-shadow: inset 0 0 0 2px rgba(8, 7, 5, .54);
	color: #fff8df;
	cursor: pointer;
	display: grid;
	font-family: ui-sans-serif, system-ui, sans-serif;
	isolation: isolate;
	min-width: 0;
	overflow: hidden;
	padding: 0;
	place-items: center;
	position: relative;
	touch-action: manipulation;
	transition: filter 120ms ease, opacity 120ms ease, transform 120ms ease;
}

.Mitzvah-action-slot:hover:not(.is-unavailable) {
	filter: brightness(1.16) saturate(1.08);
	transform: translateY(-2px);
}

.Mitzvah-action-slot:active:not(.is-unavailable) {
	transform: translateY(0) scale(.96);
}

.Mitzvah-action-slot:focus-visible {
	outline: 3px solid #d7ffff;
	outline-offset: 2px;
	z-index: 4;
}

.Mitzvah-action-slot.is-empty {
	background: linear-gradient(145deg, rgba(72, 68, 58, .42), rgba(13, 15, 14, .78));
	border-color: rgba(190, 172, 131, .25);
	cursor: default;
}

.Mitzvah-action-slot.is-unavailable {
	filter: grayscale(.84);
	opacity: .56;
}

.Mitzvah-action-slot.is-dragging {
	opacity: .42;
	transform: scale(.92);
}

.Mitzvah-slot-glyph {
	direction: rtl;
	font-family: Georgia, "Times New Roman", serif;
	font-size: clamp(14px, 1.7vw, 24px);
	font-weight: 800;
	grid-area: 1 / 1;
	letter-spacing: -.06em;
	line-height: 1;
	text-shadow: 0 2px 3px rgba(0, 0, 0, .85);
	z-index: 1;
}

.Mitzvah-slot-key {
	background: rgba(5, 6, 5, .7);
	border-radius: 0 0 0 4px;
	color: #ead49e;
	font-size: 9px;
	font-weight: 800;
	line-height: 1;
	padding: 3px 4px;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 3;
}

.Mitzvah-slot-charge {
	background: #151813;
	border: 1px solid #f4d67b;
	border-radius: 999px;
	bottom: 2px;
	color: #fff2bd;
	font-size: 10px;
	font-weight: 900;
	line-height: 15px;
	min-width: 15px;
	padding: 0 2px;
	position: absolute;
	right: 2px;
	z-index: 3;
}

.Mitzvah-slot-cooldown {
	background: conic-gradient(rgba(0, 0, 0, .8) calc(var(--cooldown-ratio, 0) * 1turn), transparent 0);
	grid-area: 1 / 1;
	inset: 0;
	pointer-events: none;
	position: absolute;
	z-index: 2;
}

.Mitzvah-slot-cooldown-time {
	color: #fff;
	font-size: clamp(11px, 1.2vw, 15px);
	font-weight: 900;
	grid-area: 1 / 1;
	text-shadow: 0 1px 3px #000, 0 0 4px #000;
	z-index: 3;
}

.Mitzvah-action-slot[data-tone="awakening"] { --ability-a: #9a8544; --ability-b: #30250f; }
.Mitzvah-action-slot[data-tone="clarity"] { --ability-a: #70b9c8; --ability-b: #15313e; }
.Mitzvah-action-slot[data-tone="illumination"] { --ability-a: #efcb61; --ability-b: #51370e; }
.Mitzvah-action-slot[data-tone="joy"] { --ability-a: #d68a40; --ability-b: #51250e; }
.Mitzvah-action-slot[data-tone="peace"] { --ability-a: #7b91bd; --ability-b: #242b47; }
.Mitzvah-action-slot[data-tone="protection"] { --ability-a: #80a960; --ability-b: #26351c; }
.Mitzvah-action-slot[data-tone="purification"] { --ability-a: #58b9bd; --ability-b: #143a46; }
.Mitzvah-action-slot[data-tone="restraint"] { --ability-a: #967d61; --ability-b: #34271d; }
.Mitzvah-action-slot[data-tone="unity"] { --ability-a: #9f78ba; --ability-b: #352040; }

@media (hover: none), (pointer: coarse) {
	.Mitzvah-action-slot {
		min-height: 44px;
	}

	.Mitzvah-action-slot:hover:not(.is-unavailable) {
		filter: none;
		transform: none;
	}
}
`;
