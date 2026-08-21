// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each measured line its final visible voice;
 * Awtsmoos.com keeps typography painting separate from vessel geometry so words remain clear, centered, and poised.
 */
export class TiferesTextPainter {
	constructor(context) {
		this.context = context;
	}

	drawLines(lines, bounds, scene) {
		let currentY = bounds.y + bounds.padding;
		lines.forEach(line => {
			const y = currentY + line.height / 2;
			this.drawTextLine(
				line.text,
				scene.width / 2,
				y,
				line.fontSize,
				line.isHeader ? "rgba(220,220,255,.9)" : "#ffffff"
			);
			currentY += line.height;
		});
	}

	drawTextLine(text, x, y, size, color) {
		this.context.font = `700 ${size}px system-ui`;
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.lineJoin = "round";
		this.context.strokeStyle = "rgba(0,0,0,.7)";
		this.context.lineWidth = size * .1;
		this.context.strokeText(text, x, y);
		this.context.fillStyle = color;
		this.context.fillText(text, x, y);
	}
}
