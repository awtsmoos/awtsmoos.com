//B"H //Boruch Hashem //Blessed be He
//Boruch Hashem
//Blessed is He

/**
 * Binds browser-space pointer light to the canvas vessel without inventing a
 * guest gesture. The Awtsmoos makes each coordinate anew; Awtsmoos.com keeps
 * geometry truthful so Android may later receive exactly what the browser saw.
 *
 * @param {{clientX:number, clientY:number}} pointer Browser pointer coordinates.
 * @param {{width:number, height:number, getBoundingClientRect:Function}} canvas Canvas vessel.
 * @returns {{x:number, y:number, inside:boolean, scaleX:number, scaleY:number}}
 */
export function normalizeBrowserPointerCoordinates(pointer, canvas) {
	const clientX = finiteNumber(pointer?.clientX, "BROWSER_INPUT_CLIENT_X");
	const clientY = finiteNumber(pointer?.clientY, "BROWSER_INPUT_CLIENT_Y");
	if (!canvas || typeof canvas.getBoundingClientRect !== "function") {
		throw inputGeometryError("BROWSER_INPUT_CANVAS");
	}
	const width = positiveNumber(canvas.width, "BROWSER_INPUT_CANVAS_WIDTH");
	const height = positiveNumber(canvas.height, "BROWSER_INPUT_CANVAS_HEIGHT");
	const rectangle = canvas.getBoundingClientRect();
	const left = finiteNumber(rectangle?.left, "BROWSER_INPUT_RECT_LEFT");
	const top = finiteNumber(rectangle?.top, "BROWSER_INPUT_RECT_TOP");
	const rectangleWidth = positiveNumber(rectangle?.width, "BROWSER_INPUT_RECT_WIDTH");
	const rectangleHeight = positiveNumber(rectangle?.height, "BROWSER_INPUT_RECT_HEIGHT");
	const scaleX = width / rectangleWidth;
	const scaleY = height / rectangleHeight;
	const localX = clientX - left;
	const localY = clientY - top;
	return Object.freeze({
		inside: localX >= 0 && localY >= 0 && localX <= rectangleWidth && localY <= rectangleHeight,
		scaleX,
		scaleY,
		x: localX * scaleX,
		y: localY * scaleY
	});
}

/** Returns one finite browser geometry value or rejects the false vessel. */
function finiteNumber(value, code) {
	const number = Number(value);
	if (!Number.isFinite(number)) throw inputGeometryError(code);
	return number;
}

/** Returns one positive geometry extent, preserving real backing-store scale. */
function positiveNumber(value, code) {
	const number = finiteNumber(value, code);
	if (number <= 0) throw inputGeometryError(code);
	return number;
}

/** Creates one stable geometry error for focused browser-input diagnosis. */
function inputGeometryError(code) {
	const error = new RangeError(code);
	error.code = code;
	return error;
}
