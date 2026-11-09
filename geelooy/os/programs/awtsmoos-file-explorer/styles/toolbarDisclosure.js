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
.toolbar-overflow-summary.toolbar-overflow-summary {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 40px;
	padding: 0 12px;
	border: 1px solid rgba(255, 255, 255, .11);
	border-radius: 11px;
	background: rgba(255, 255, 255, .045);
	color: #f6f8ff;
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
.toolbar-overflow.toolbar-overflow[open] > .toolbar-overflow-summary.toolbar-overflow-summary {
	background: rgba(124, 156, 255, .14);
	border-color: rgba(124, 156, 255, .28);
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
.toolbar-overflow-panel.toolbar-overflow-panel .toolbar-group.toolbar-group {
	align-content: start;
	flex-wrap: wrap;
	padding: 6px;
	border-radius: 12px;
	background: rgba(255, 255, 255, .025);
}
.toolbar-overflow-panel.toolbar-overflow-panel .toolbar-group.toolbar-group button {
	min-height: 40px;
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
