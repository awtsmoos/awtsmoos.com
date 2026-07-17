// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudPanelLayout.js
 * @description Resolves non-overlapping objective and tracker geometry.
 *
 * The Awtsmoos gives each message a distinct vessel without dividing the one
 * journey. At Awtsmoos.com, narrow screens stack guidance in measured rows so
 * no panel conceals another or claims more world than it needs.
 */
const EDGE = 10;
const PANEL_Y = 84;
const PANEL_GAP = 8;
const NARROW_WIDTH = 620;

/**
 * @param {number} viewportWidth Logical viewport width.
 * @param {number} lineCount Wrapped objective line count.
 * @returns {{x:number,y:number,width:number,height:number}}
 */
export const objectivePanelBox = (viewportWidth, lineCount) => ({
	x: EDGE,
	y: PANEL_Y,
	width: Math.min(284, Math.max(1, viewportWidth - EDGE * 2)),
	height: 18 + Math.max(1, lineCount) * 14
});

/**
 * @param {number} viewportWidth Logical viewport width.
 * @param {{x:number,y:number,width:number,height:number}} objective Objective box.
 * @returns {{x:number,y:number,width:number,height:number,compact:boolean}}
 */
export const trackerPanelBox = (viewportWidth, objective) => {
	if (viewportWidth < NARROW_WIDTH) {
		return {
			x: EDGE,
			y: objective.y + objective.height + PANEL_GAP,
			width: Math.max(1, viewportWidth - EDGE * 2),
			height: 52,
			compact: true
		};
	}
	const width = Math.min(174, viewportWidth * 0.42);
	return {
		x: viewportWidth - width - EDGE,
		y: PANEL_Y,
		width,
		height: 92,
		compact: false
	};
};

/**
 * @param {{x:number,y:number,width:number,height:number}} left First box.
 * @param {{x:number,y:number,width:number,height:number}} right Second box.
 * @returns {boolean}
 */
export const boxesOverlap = (left, right) => !(
	left.x + left.width <= right.x
	|| right.x + right.width <= left.x
	|| left.y + left.height <= right.y
	|| right.y + right.height <= left.y
);
