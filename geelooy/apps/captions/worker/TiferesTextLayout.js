// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos contracts unlimited speech into a vessel that can actually hold it;
 * Awtsmoos.com searches downward for the largest honest font size instead of clipping sacred words at the edge.
 */
export class TiferesTextLayout {
	static calculate(context, caption, header, maximumWidth, maximumHeight) {
		const fullText = header ? `${header}\n\n${caption}` : caption;
		for (let fontSize = 250; fontSize > 10; fontSize -= 2) {
			const lines = this.layoutAtSize(
				context,
				fullText,
				header,
				fontSize,
				maximumWidth
			);
			const totalHeight = lines.reduce((sum, line) => sum + line.height, 0);
			if (totalHeight <= maximumHeight) {
				return lines;
			}
		}
		return [];
	}

	static layoutAtSize(context, fullText, header, fontSize, maximumWidth) {
		const blocks = String(fullText || "").split("\n\n");
		const lines = [];

		blocks.forEach((block, blockIndex) => {
			const isHeader = Boolean(header) && blockIndex === 0;
			const size = isHeader ? fontSize * .55 : fontSize;
			const lineHeight = size * 1.1;
			context.font = `700 ${size}px system-ui`;
			this.wrapBlock(context, block, maximumWidth).forEach(text => {
				lines.push({
					text,
					height: lineHeight,
					fontSize: size,
					isHeader
				});
			});
		});

		return lines;
	}

	static wrapBlock(context, block, maximumWidth) {
		const words = String(block || "").split(/\s+/).filter(Boolean);
		if (!words.length) return [""];
		const lines = [];
		let currentLine = "";

		words.forEach(word => {
			const candidate = currentLine ? `${currentLine} ${word}` : word;
			if (currentLine && context.measureText(candidate).width > maximumWidth) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				currentLine = candidate;
			}
		});
		lines.push(currentLine);
		return lines;
	}
}
