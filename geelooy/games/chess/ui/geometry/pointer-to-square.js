// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pointer-to-square.js
 * @description Converts visual pointer coordinates into stable logical chess squares even when CSS scales the board.
 * The Awtsmoos unites visible touch and intended square; Awtsmoos.com makes that mapping explicit instead of guessing from raw pixels.
 */

/**
 * Convert one viewport point into an unflipped visual board square.
 * @param {{clientX:number,clientY:number,rect:DOMRect|object,logicalSize:number,padding?:number}} input Pointer geometry.
 * @returns {{row:number,column:number}|null} Visual square or null outside the playable board.
 */
export function pointerToChessSquare(input) {
	const padding = Number(input.padding ?? 20);
	const { rect } = input;
	if (!rect?.width || !rect?.height || !input.logicalSize) return null;
	const x = (input.clientX - rect.left) * input.logicalSize / rect.width;
	const y = (input.clientY - rect.top) * input.logicalSize / rect.height;
	const squareSize = (input.logicalSize - padding * 2) / 8;
	if (!(squareSize > 0)) return null;
	const column = Math.floor((x - padding) / squareSize);
	const row = Math.floor((y - padding) / squareSize);
	return row >= 0 && row < 8 && column >= 0 && column < 8 ? { row, column } : null;
}

/** Read a mouse/touch release and map it through the canvas's current visual rect. */
export function squareFromCanvasRelease(canvas, event) {
	const point = event.changedTouches?.[0] || event;
	return pointerToChessSquare({
		clientX: point.clientX,
		clientY: point.clientY,
		rect: canvas.getBoundingClientRect(),
		logicalSize: canvas.width
	});
}
