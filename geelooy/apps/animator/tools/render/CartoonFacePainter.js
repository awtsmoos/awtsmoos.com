// B"H
// Boruch Hashem
// Blessed is He

/**
 * Eyes, brows, lashes, hair, and speech gather in this small theater. The
 * Awtsmoos renews every glance and mouth shape without borrowing another show.
 */
export class CartoonFacePainter {
	static paint(canvas, x, y, dimensions, character, face, viewName) {
		canvas.ellipse(x, y, dimensions.headWidth * 0.55, dimensions.headHeight * 0.55, '#111827');
		canvas.ellipse(x, y, dimensions.headWidth * 0.49, dimensions.headHeight * 0.49, character.palette.skin);
		this.hair(canvas, x, y - dimensions.headHeight * 0.4, dimensions, character);
		if (viewName === 'back') return;
		const side = viewName.includes('side');
		const eyeGap = side ? dimensions.headWidth * 0.08 : dimensions.headWidth * 0.2;
		this.eye(canvas, x - eyeGap, y - 8 * dimensions.scale, dimensions, face, side && viewName.includes('Right'));
		if (!side) this.eye(canvas, x + eyeGap, y - 8 * dimensions.scale, dimensions, face, false);
		this.brows(canvas, x, y, dimensions, face, side);
		this.mouth(canvas, x, y + dimensions.headHeight * 0.23, dimensions, face);
	}

	static eye(canvas, x, y, dimensions, face, mirror) {
		const open = Math.max(1, 10 * dimensions.scale * face.eyes.lidOpen);
		canvas.ellipse(x, y, 8 * dimensions.scale, open, '#ffffff');
		canvas.circle(
			x + face.eyes.gazeX * 3 * (mirror ? -1 : 1),
			y + face.eyes.gazeY * 2,
			3.2 * dimensions.scale,
			'#172554'
		);
		for (let lash = 0; lash < face.eyes.lashes.count; lash += 1) {
			canvas.line(
				x - 5 + lash * 3,
				y - open,
				x - 7 + lash * 3,
				y - open - 4,
				1,
				'#111827'
			);
		}
	}

	static brows(canvas, x, y, dimensions, face, side) {
		const rise = (face.brows.outer - face.brows.inner) * 8;
		canvas.line(
			x - dimensions.headWidth * 0.3,
			y - 23 - rise,
			x - dimensions.headWidth * 0.08,
			y - 21 + rise,
			3,
			'#21130f'
		);
		if (side) return;
		canvas.line(
			x + dimensions.headWidth * 0.08,
			y - 21 + rise,
			x + dimensions.headWidth * 0.3,
			y - 23 - rise,
			3,
			'#21130f'
		);
	}

	static mouth(canvas, x, y, dimensions, face) {
		const width = Math.max(8, 26 * dimensions.scale * face.mouth.width);
		const height = Math.max(2, 18 * dimensions.scale * face.mouth.jawOpen);
		const mouthY = y + face.mouth.frown * 4 - face.mouth.smile * 2;
		canvas.ellipse(x, mouthY, width, height, '#49111c');
		if (height > 5) {
			canvas.rect(x - width * 0.55, y - 1, width * 1.1, 3, '#f8fafc');
		}
	}

	static hair(canvas, x, y, dimensions, character) {
		const count = character.hair.style === 'crop' ? 5 : 8;
		for (let index = 0; index < count; index += 1) {
			const offset = (index - (count - 1) / 2) * dimensions.headWidth * 0.11;
			canvas.circle(
				x + offset,
				y + Math.abs(offset) * 0.15,
				9 * dimensions.scale,
				character.palette.hair
			);
		}
	}
}
