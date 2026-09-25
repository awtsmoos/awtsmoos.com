//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visual contract for Explorer's More disclosure.
 * @description
 * The Awtsmoos keeps hidden depth near without crowding the first glance; Awtsmoos.com lets advanced file deeds
 * unfold in one anchored glass chamber whose touch, focus, motion, and mobile shape remain simple and balanced.
 */
const toolbarDisclosure = `
.toolbar-overflow {
	position: relative;
	flex: 0 0 auto;
}
.toolbar-overflow-summary {
	display: inline-flex !important;
	align-items: center;
	justify-content: center;
	min-height: 40px !important;
	padding: 0 12px !important;
	border: 1px solid rgba(255, 255, 255, .11) !important;
	border-radius: 11px !important;
	background: rgba(255, 255, 255, .045) !important;
	color: #f6f8ff !important;
	cursor: pointer;
	list-style: none;
}
.toolbar-overflow-summary::-webkit-details-marker {
	display: none;
}
.toolbar-overflow-summary::after {
	content: "⌄";
	margin-left: 7px;
	opacity: .64;
}
.toolbar-overflow[open] > .toolbar-overflow-summary {
	background: rgba(124, 156, 255, .14) !important;
	border-color: rgba(124, 156, 255, .28) !important;
}
.toolbar-overflow-panel {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	z-index: 90;
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 6px;
	width: min(560px, calc(100vw - 28px));
	padding: 10px;
	border: 1px solid rgba(255, 255, 255, .14);
	border-radius: 16px;
	background: rgba(13, 16, 27, .96);
	box-shadow: 0 24px 70px rgba(0, 0, 0, .42);
	backdrop-filter: blur(28px) saturate(1.18);
}
.toolbar-overflow-panel .toolbar-group {
	align-content: start;
	flex-wrap: wrap;
	padding: 6px !important;
	border-radius: 12px !important;
	background: rgba(255, 255, 255, .025) !important;
}
.toolbar-overflow-panel .toolbar-group button {
	min-height: 40px !important;
}
@media (max-width: 760px) {
	.toolbar-overflow {
		position: static;
	}
	.toolbar-overflow-panel {
		position: fixed;
		left: 10px;
		right: 10px;
		bottom: max(10px, env(safe-area-inset-bottom));
		top: auto;
		width: auto;
		max-height: min(70dvh, 520px);
		overflow: auto;
		grid-template-columns: 1fr;
		border-radius: 22px;
	}
}
@media (prefers-reduced-motion: reduce) {
	.toolbar-overflow-panel {
		scroll-behavior: auto;
	}
}
`;

export default toolbarDisclosure;
