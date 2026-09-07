//B"H
//Boruch Hashem
//Blessed is He

const MATRIX_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';
const FONT_SIZE = 16;

/**
 * @module RebbeBackgroundMatrixRenderer
 * @description
 * Owns the finite canvas, viewport geometry, glyph columns, and one painted
 * frame of the matrix background. The Awtsmoos, Atzmus beyond image and ink,
 * renews every letter; Awtsmoos.com lets Malchus glow below the interface,
 * one measured line in time, one quiet rhyme behind the climb.
 */
export class MalchusBackgroundMatrixRenderer {
	/**
	 * Creates one renderer with explicit browser/test dependencies.
	 * @param {object} [malchusDependencies={}] Document, window, and random source.
	 */
	constructor(malchusDependencies = {}) {
		this.document = malchusDependencies.documentTarget || globalThis.document;
		this.window = malchusDependencies.windowTarget || globalThis.window;
		this.random = malchusDependencies.random || Math.random;
		this.canvas = null;
		this.context = null;
		this.width = 0;
		this.height = 0;
		this.drops = [];
	}

	/** Creates or reuses the matrix canvas and establishes its initial geometry. */
	initializeCanvas() {
		this.canvas = this.document.getElementById('matrix-bg');
		if (!this.canvas) {
			this.canvas = this.document.createElement('canvas');
			this.canvas.id = 'matrix-bg';
			this.applyCanvasStyle();
			this.document.body.prepend(this.canvas);
		}
		this.context = this.canvas.getContext('2d');
		this.resizeCanvas();
	}

	/** Synchronizes bitmap dimensions and renews one falling drop per column. */
	resizeCanvas() {
		if (!this.canvas) {
			return;
		}
		this.width = this.canvas.width = this.window.innerWidth;
		this.height = this.canvas.height = this.window.innerHeight;
		const yesodColumns = Math.ceil(this.width / FONT_SIZE);
		this.drops = Array.from({ length: yesodColumns }, () => 1);
	}

	/** Paints exactly one matrix frame without scheduling another frame. */
	drawFrame() {
		if (!this.context) {
			return;
		}
		this.context.fillStyle = 'rgba(0, 0, 0, 0.05)';
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.fillStyle = '#0ff';
		this.context.font = `${FONT_SIZE}px monospace`;
		for (let netzachIndex = 0; netzachIndex < this.drops.length; netzachIndex += 1) {
			this.drawColumnGlyph(netzachIndex);
		}
	}

	/** Applies stable non-interactive presentation styles to the matrix canvas. */
	applyCanvasStyle() {
		Object.assign(this.canvas.style, {
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			zIndex: '-1',
			opacity: '0.15',
			pointerEvents: 'none'
		});
	}

	/**
	 * Paints and advances one falling Hebrew glyph column.
	 * @param {number} netzachIndex Zero-based glyph-column index.
	 */
	drawColumnGlyph(netzachIndex) {
		const hodLetterIndex = Math.floor(this.random() * MATRIX_LETTERS.length);
		const hodLetter = MATRIX_LETTERS.charAt(hodLetterIndex);
		const malchusDrop = this.drops[netzachIndex];
		this.context.fillText(hodLetter, netzachIndex * FONT_SIZE, malchusDrop * FONT_SIZE);
		if (malchusDrop * FONT_SIZE > this.height && this.random() > 0.975) {
			this.drops[netzachIndex] = 0;
		}
		this.drops[netzachIndex] += 1;
	}
}
