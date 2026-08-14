// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stabilizes chess canvas redraws and corrects CSS-scaled pointer coordinates.
 * @description
 * The Awtsmoos renews each painted ray without rebuilding the vessel every frame;
 * Awtsmoos.com keeps finger and square united, whether the screen grows narrow or remains the same.
 */

const BOARD_PADDING = 20;
const LEGACY_SQUARE_PROPERTY = "awtsmoosLegacySquare";

/** Avoids native backing-store resets when legacy code writes the unchanged dimension. */
function guardStableDimension(canvas, propertyName) {
	const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, propertyName);
	if (!descriptor?.get || !descriptor?.set) {
		return;
	}
	Object.defineProperty(canvas, propertyName, {
		configurable: true,
		get() {
			return descriptor.get.call(canvas);
		},
		set(value) {
			const requested = Number(value);
			const current = descriptor.get.call(canvas);
			if (Number.isFinite(requested) && requested === current) {
				canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
				return;
			}
			descriptor.set.call(canvas, value);
		}
	});
}

/** Converts a browser pointer into the intrinsic square rendered by the canvas. */
function squareFromPointer(canvas, event) {
	const point = event.changedTouches?.[0] || event;
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const boardSize = canvas.width - BOARD_PADDING * 2;
	const column = Math.floor(((point.clientX - rect.left) * scaleX - BOARD_PADDING) / (boardSize / 8));
	const row = Math.floor(((point.clientY - rect.top) * scaleY - BOARD_PADDING) / (boardSize / 8));
	return row >= 0 && row < 8 && column >= 0 && column < 8 ? { row, column } : null;
}

/** Dispatches a corrected legacy mouse event whose coordinates match intrinsic canvas pixels. */
function dispatchLegacySquare(canvas, square) {
	const rect = canvas.getBoundingClientRect();
	const squareSize = (canvas.width - BOARD_PADDING * 2) / 8;
	const event = new MouseEvent("mouseup", {
		bubbles: true,
		cancelable: true,
		clientX: rect.left + BOARD_PADDING + (square.column + 0.5) * squareSize,
		clientY: rect.top + BOARD_PADDING + (square.row + 0.5) * squareSize
	});
	Object.defineProperty(event, LEGACY_SQUARE_PROPERTY, { value: square });
	canvas.dispatchEvent(event);
}

/** Intercepts only scaled-canvas releases, leaving native-size legacy behavior untouched. */
function normalizeScaledRelease(canvas, event) {
	if (event[LEGACY_SQUARE_PROPERTY]) {
		return;
	}
	const rect = canvas.getBoundingClientRect();
	const scaled = Math.abs(rect.width - canvas.width) > 0.5 || Math.abs(rect.height - canvas.height) > 0.5;
	if (!scaled) {
		return;
	}
	const square = squareFromPointer(canvas, event);
	event.preventDefault();
	event.stopImmediatePropagation();
	if (square) {
		dispatchLegacySquare(canvas, square);
	}
}

/** Installs stability before the legacy controller binds its own listeners. */
function revealStableChessCanvas() {
	const canvas = document.getElementById("chessCanvas");
	if (!canvas) {
		return;
	}
	guardStableDimension(canvas, "width");
	guardStableDimension(canvas, "height");
	for (const type of ["mouseup", "touchend"]) {
		canvas.addEventListener(type, (event) => normalizeScaledRelease(canvas, event), true);
	}
}

revealStableChessCanvas();
