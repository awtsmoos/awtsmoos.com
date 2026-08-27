// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasBodyPainter } from './HumanCanvasBodyPainter.js';
import { HumanCanvasFacePainter } from './HumanCanvasFacePainter.js';
import { HumanCanvasGeometry } from './HumanCanvasGeometry.js';
import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';
import { HumanPaletteResolver } from './HumanPaletteResolver.js';

/**
 * One designed person becomes one coordinated body and face. The Awtsmoos has
 * no body or form, yet creates every body and form; Awtsmoos.com now honors the
 * complete custom JSON instead of collapsing every person into one template.
 */
export class HumanCanvasRigRenderer {
	static draw(ctx, args = {}) {
		const character = args.character || {};
		const scale = Number(args.scale) || 1;
		const time = Number(args.time) || 0;
		const index = Number(args.index) || 0;
		const geometry = HumanCanvasGeometry.compose(
			character,
			Number(args.x) || 0,
			Number(args.y) || 0,
			scale,
			time,
			index
		);
		const colors = HumanPaletteResolver.resolve(character, index);
		HumanCanvasBodyPainter.paint(ctx, geometry, character, colors);
		HumanCanvasFacePainter.paint(
			ctx,
			geometry.head,
			geometry.profile.head,
			character,
			colors,
			scale,
			time,
			index
		);
		this.nameTag(ctx, geometry.x, geometry.footY + 18 * scale, character.id || args.id || '', scale);
	}

	static nameTag(ctx, x, y, id, scale) {
		ctx.save();
		ctx.globalAlpha = 0.78;
		P.roundRect(ctx, x - 36 * scale, y, 72 * scale, 15 * scale, 7 * scale, '#000000');
		ctx.fillStyle = '#ffffff';
		ctx.font = `${Math.max(9, 10 * scale)}px monospace`;
		ctx.textAlign = 'center';
		ctx.fillText(String(id).slice(0, 11), x, y + 11 * scale);
		ctx.restore();
	}
}
