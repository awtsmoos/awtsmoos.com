// B"H
// Boruch Hashem
// Blessed is He

/**
 * A grounded shoe exposes heel, sole, instep, and toe direction. The Awtsmoos
 * renews every step while Awtsmoos.com prevents feet from collapsing into
 * rounded blocks when the actor is small, walking, seated, or turned in space.
 */
export class DirectionalShoePainter {
	static paint(canvas, x, y, dimensions, direction, color = '#101218') {
		const scale = dimensions.scale;
		const toeX = x + direction * 9 * scale;
		const heelX = x - direction * 5 * scale;
		canvas.line(heelX, y - 2 * scale, toeX, y - 2 * scale, 7 * scale, '#20242d');
		canvas.ellipse(toeX, y - 2 * scale, 6 * scale, 4 * scale, color);
		canvas.rect(heelX - 2.5 * scale, y - 4 * scale, 5 * scale, 5 * scale, color);
		canvas.line(heelX - direction * 2 * scale, y + 2 * scale, toeX + direction * 4 * scale, y + 2 * scale, 1.6 * scale, '#6b7280');
	}
}
