/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos measures language inside finite vessels, searching for the
 * largest readable line arrangement without assuming one alphabet or direction.
 */

self.einSofRenderer.cacheOverlays = async function cacheOverlays() {
	return new Map();
};

self.einSofRenderer.measureLine = function measureLine(context, text) {
	return context.measureText(text).width;
};

self.einSofRenderer.wrapText = function wrapText(context, text, maximumWidth) {
	if (!text) {
		return [];
	}
	const paragraphs = String(text).split("\n");
	const lines = [];
	paragraphs.forEach(paragraph => {
		const words = paragraph.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) {
			lines.push("");
			return;
		}
		let currentLine = words.shift();
		words.forEach(word => {
			const candidate = `${currentLine} ${word}`;
			if (context.measureText(candidate).width <= maximumWidth) {
				currentLine = candidate;
				return;
			}
			lines.push(currentLine);
			currentLine = word;
		});
		lines.push(currentLine);
	});
	return lines;
};

self.einSofRenderer.calculateOptimalLayout = function calculateOptimalLayout(
	context,
	text,
	boxWidth,
	boxHeight,
	fontName
) {
	let lowerBound = 10;
	let upperBound = 200;
	let optimalSize = lowerBound;
	let optimalLines = [];
	while (lowerBound <= upperBound) {
		const candidateSize = Math.floor((lowerBound + upperBound) / 2);
		context.font = `bold ${candidateSize}px ${fontName}`;
		const lines = self.einSofRenderer.wrapText(context, text, boxWidth);
		const lineHeight = candidateSize * 1.2;
		const totalHeight = lines.length * lineHeight;
		const widestLine = lines.reduce((maximum, line) => {
			return Math.max(maximum, context.measureText(line).width);
		}, 0);
		if (totalHeight <= boxHeight && widestLine <= boxWidth) {
			optimalSize = candidateSize;
			optimalLines = lines;
			lowerBound = candidateSize + 1;
		} else {
			upperBound = candidateSize - 1;
		}
	}
	if (optimalLines.length === 0) {
		context.font = `bold ${optimalSize}px ${fontName}`;
		optimalLines = self.einSofRenderer.wrapText(context, text, boxWidth);
	}
	return {
		fontSize: optimalSize,
		lines: optimalLines,
		lineHeight: optimalSize * 1.2
	};
};
