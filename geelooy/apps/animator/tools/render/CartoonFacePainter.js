// B"H
// Boruch Hashem
// Blessed is He

/**
 * Eyes, brows, cheeks, lips, hair, beard, and mustache gather in a view-aware
 * theater. The Awtsmoos has no face or form, yet renews every visible face;
 * Awtsmoos.com preserves identity through front, profile, and three-quarter views.
 */
export class CartoonFacePainter {
	static paint(canvas, x, y, dimensions, character, face, viewName) {
		const profile = String(viewName).includes('side');
		const rear = viewName === 'back';
		const direction = String(viewName).includes('Left') ? -1 : 1;
		const skin = character.palette.skin;
		canvas.ellipse(x, y, dimensions.headWidth * 0.55, dimensions.headHeight * 0.55, '#111827');
		canvas.ellipse(x, y, dimensions.headWidth * 0.49, dimensions.headHeight * 0.49, skin);
		this.hair(canvas, x, y, dimensions, character, viewName);
		if (rear) {
			return;
		}

		const eyeGap = profile
			? dimensions.headWidth * 0.1
			: dimensions.headWidth * (character.face?.eyeSeparation || 0.2);
		this.eye(canvas, x - eyeGap * direction, y - 8 * dimensions.scale, dimensions, face, profile);
		if (!profile) {
			this.eye(canvas, x + eyeGap, y - 8 * dimensions.scale, dimensions, face, false);
		}
		this.brows(canvas, x, y, dimensions, face, profile, direction, character);
		this.cheeks(canvas, x, y, dimensions, face);
		this.mouth(canvas, x, y + dimensions.headHeight * 0.23, dimensions, face, profile, direction);
		this.facialHair(canvas, x, y, dimensions, character, profile, direction);
	}

	static eye(canvas, x, y, dimensions, face, mirror) {
		const eyeScale = Number(dimensions.scale) * Number(face.eyes?.scale || 1);
		const open = Math.max(1, 10 * eyeScale * face.eyes.lidOpen);
		canvas.ellipse(x, y, 8 * eyeScale, open, '#ffffff');
		canvas.circle(
			x + face.eyes.gazeX * 3 * (mirror ? -1 : 1),
			y + face.eyes.gazeY * 2,
			3.2 * eyeScale,
			'#172554'
		);
	}

	static brows(canvas, x, y, dimensions, face, profile, direction, character) {
		const rise = (face.brows.outer - face.brows.inner) * 8;
		const weight = Math.max(2, 3 * dimensions.scale * Number(character.face?.browWeight || 1));
		const left = profile ? x + direction * dimensions.headWidth * 0.08 : x - dimensions.headWidth * 0.3;
		const right = profile ? x + direction * dimensions.headWidth * 0.3 : x - dimensions.headWidth * 0.08;
		canvas.line(left, y - 21 + rise, right, y - 23 - rise, weight, character.palette.brow);
		if (!profile) {
			canvas.line(x + dimensions.headWidth * 0.08, y - 21 + rise, x + dimensions.headWidth * 0.3, y - 23 - rise, weight, character.palette.brow);
		}
	}

	static cheeks(canvas, x, y, dimensions, face) {
		const lift = Math.max(0, Number(face.cheeks?.lift || face.mouth?.smile || 0));
		if (lift <= 0.08) {
			return;
		}
		const radius = 5 * dimensions.scale + lift * 3;
		canvas.circle(x - dimensions.headWidth * 0.28, y + 8, radius, '#e78a86');
		canvas.circle(x + dimensions.headWidth * 0.28, y + 8, radius, '#e78a86');
	}

	static mouth(canvas, x, y, dimensions, face, profile, direction) {
		const width = Math.max(7, 26 * dimensions.scale * face.mouth.width * (profile ? 0.58 : 1));
		const height = Math.max(2, 18 * dimensions.scale * face.mouth.jawOpen);
		const mouthX = profile ? x + direction * dimensions.headWidth * 0.36 : x;
		const mouthY = y + face.mouth.frown * 4 - face.mouth.smile * 2;
		canvas.ellipse(mouthX, mouthY, width, height, '#49111c');
		if (height > 5) {
			canvas.rect(mouthX - width * 0.55, mouthY - 1, width * 1.1, 3, '#f8fafc');
		}
	}

	static hair(canvas, x, y, dimensions, character, viewName) {
		const hair = character.hair || {};
		if (hair.length === 'bald') {
			return;
		}
		const color = hair.color || character.palette.hair;
		const count = ['braids', 'locs'].includes(hair.style) ? 8 : hair.style === 'crop' ? 5 : 7;
		for (let index = 0; index < count; index += 1) {
			const offset = (index - (count - 1) / 2) * dimensions.headWidth * 0.12;
			canvas.circle(x + offset, y - dimensions.headHeight * 0.38 + Math.abs(offset) * 0.12, 9 * dimensions.scale, color);
		}
		const length = { short: 10, medium: 28, long: 58, veryLong: 88 }[hair.length] || 24;
		if (length > 12) {
			for (const side of [-1, 1]) {
				canvas.rect(x + side * dimensions.headWidth * 0.39 - 5, y - 4, 10, length * dimensions.scale, color);
			}
		}
	}

	static facialHair(canvas, x, y, dimensions, character, profile, direction) {
		const facial = character.facialHair || {};
		const color = facial.color || character.palette.hair;
		const beard = facial.beard?.style || 'none';
		if (beard !== 'none') {
			const width = profile ? dimensions.headWidth * 0.3 : dimensions.headWidth * (beard === 'goatee' ? 0.22 : 0.48);
			const length = dimensions.headHeight * ({ stubble: 0.12, short: 0.2, boxed: 0.28, full: 0.38, long: 0.72, goatee: 0.38 }[beard] || 0.3);
			const beardX = profile ? x + direction * dimensions.headWidth * 0.28 : x;
			canvas.ellipse(beardX, y + dimensions.headHeight * 0.38, width, length, color);
		}
		const mustache = facial.mustache?.style || 'none';
		if (mustache !== 'none') {
			const width = dimensions.headWidth * ({ pencil: 0.22, natural: 0.3, handlebar: 0.42, walrus: 0.36 }[mustache] || 0.3);
			const mustacheX = profile ? x + direction * dimensions.headWidth * 0.34 : x;
			canvas.line(mustacheX - width, y + 7, mustacheX + width, y + 7, 4 * dimensions.scale, color);
		}
	}
}
