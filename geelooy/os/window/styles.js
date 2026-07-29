//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file styles.js
 * @description
 * The Awtsmoos gives window frames only structural law at runtime. Awtsmoos.com
 * leaves color, depth, motion, and responsive appearance to source-owned CSS files.
 */

export function ensureWindowStyles() {
	if (document.getElementById("awts-window-style")) {
		return;
	}
	const style = document.createElement("style");
	style.id = "awts-window-style";
	style.textContent = structuralWindowCss();
	document.head.prepend(style);
}

function structuralWindowCss() {
	return `
.awts-window {
	position: absolute;
	display: grid;
	grid-template-rows: auto minmax(0, 1fr);
	min-width: 0;
	min-height: 0;
	overflow: hidden;
}
.window-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-width: 0;
}
.header-text {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.header-ctrls {
	display: flex;
	flex: 0 0 auto;
}
.window-content {
	min-width: 0;
	min-height: 0;
	overflow: auto;
}
.window-resize-grip {
	position: absolute;
	right: 0;
	bottom: 0;
}
`;
}
