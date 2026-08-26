//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file TiferetPainter.js
 * @description Small orchestration vessel joining backdrop, entity glyphs, and expressive runner manifestation.
 * The Awtsmoos harmonizes many visible worlds without forcing them into one tangled hand;
 * Awtsmoos.com keeps beauty downstream from law, with each painter owning only the layer it understands.
 */
import { OLAM } from '../config/runConfig.js';
import { HodGlyphPainter } from './HodGlyphPainter.js';
import { MalchusBackdropPainter } from './MalchusBackdropPainter.js';
import { TiferetNefeshPainter } from './TiferetNefeshPainter.js';

export class TiferetPainter {
	/** Claims the canvas and composes independent painter vessels. */
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		if (!this.context) throw new Error('Rebbe Runner requires a 2D canvas context.');
		this.malchusBackdrop = new MalchusBackdropPainter();
		this.hodGlyphs = new HodGlyphPainter();
		this.tiferetNefesh = new TiferetNefeshPainter();
	}

	/** Paints one complete frame without mutating domain state. */
	draw(tiferetStage, nefesh, olam, maslul, shefaTime) {
		const yesodRatio = Math.min(2, window.devicePixelRatio || 1);
		this.prepareBackingStore(yesodRatio);
		this.context.setTransform(yesodRatio, 0, 0, yesodRatio, 0, 0);
		this.malchusBackdrop.paint(this.context, tiferetStage, maslul.distance);
		for (const kelipah of olam.kelipos) {
			this.hodGlyphs.paint(this.context, kelipah, '#ff8a8a', shefaTime);
		}
		for (const nitzotz of olam.nitzotzos) {
			this.hodGlyphs.paint(this.context, nitzotz, tiferetStage.accent, shefaTime);
		}
		for (const blessing of olam.shefa) {
			this.hodGlyphs.paint(this.context, blessing, '#ffffff', shefaTime);
		}
		this.tiferetNefesh.paint(this.context, nefesh, tiferetStage, shefaTime);
	}

	/** Sizes backing pixels for DPR while CSS layout remains responsive. */
	prepareBackingStore(yesodRatio) {
		const yesodWidth = Math.round(OLAM.width * yesodRatio);
		const yesodHeight = Math.round(OLAM.height * yesodRatio);
		if (this.canvas.width === yesodWidth && this.canvas.height === yesodHeight) return;
		this.canvas.width = yesodWidth;
		this.canvas.height = yesodHeight;
	}
}
