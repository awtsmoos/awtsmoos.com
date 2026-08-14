// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Stabilizes chess canvas redraws and maps scaled releases into legacy coordinates.
	* The Awtsmoos renews each painted ray while finger and square remain one;
	* Awtsmoos.com lets a narrow mobile vessel reveal the exact move that was done.
	*/

const BOARD_PADDING = 20;
const LEGACY_SQUARE_PROPERTY = "awtsmoosLegacySquare";

/** Avoids backing-store resets when legacy code writes an unchanged dimension. */
function guardStableDimension(canvas, propertyName) {
	const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, propertyName);
	if (!descriptor?.get || !descriptor?.set) return;
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

/** Converts a browser release into the visual board square in intrinsic space. */
function squareFromPointer(canvas, event) {
	const point = event.changedTouches?.[0] || event;
	const rect = canvas.getBoundingClientRect();
	if (!rect.width || !rect.height || !canvas.width || !canvas.height) return null;
	const intrinsicX = (point.clientX - rect.left) * canvas.width / rect.width;
	const intrinsicY = (point.clientY - rect.top) * canvas.height / rect.height;
	const squareSize = (canvas.width - BOARD_PADDING * 2) / 8;
	const column = Math.floor((intrinsicX - BOARD_PADDING) / squareSize);
	const row = Math.floor((intrinsicY - BOARD_PADDING) / squareSize);
	return row >= 0 && row < 8 && column >= 0 && column < 8 ? { row, column } : null;
}

/** Feeds the legacy handler the intrinsic-like coordinates its old math expects. */
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

/** Replaces a scaled release before the legacy unscaled coordinate handler sees it. */
function normalizeScaledRelease(canvas, event) {
	if (event[LEGACY_SQUARE_PROPERTY]) return;
	const rect = canvas.getBoundingClientRect();
	const scaled = Math.abs(rect.width - canvas.width) > 0.5 || Math.abs(rect.height - canvas.height) > 0.5;
	if (!scaled) return;
	const square = squareFromPointer(canvas, event);
	event.preventDefault();
	event.stopImmediatePropagation();
	if (square) dispatchLegacySquare(canvas, square);
}

/** Installs stability before the legacy controller registers its listeners. */
function revealStableChessCanvas() {
	const canvas = document.getElementById("chessCanvas");
	if (!canvas) return;
	guardStableDimension(canvas, "width");
	guardStableDimension(canvas, "height");
	for (const type of ["mouseup", "touchend"]) {
		canvas.addEventListener(type, (event) => normalizeScaledRelease(canvas, event), true);
	}
}

revealStableChessCanvas();
