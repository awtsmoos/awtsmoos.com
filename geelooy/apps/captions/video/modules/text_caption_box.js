/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos places a caption inside a measured visual vessel, preserving
 * contrast, dual-language rhythm, and optional glitch without losing legibility.
 */

self.einSofRenderer.applyCaptionGlitch = function applyCaptionGlitch(text, enabled) {
	if (!enabled || Math.random() > .05) {
		return text;
	}
	return String(text).split("").map(character => {
		return Math.random() > .9
			? String.fromCharCode(33 + Math.floor(Math.random() * 90))
			: character;
	}).join("");
};

self.einSofRenderer.drawCaptionBox = function drawCaptionBox(options) {
	const {
		context,
		text,
		primary,
		secondaryText,
		settings,
		resolution,
		palette
	} = options;
	if (!text) {
		return;
	}
	const widthPercent = settings.textBoxWidth ?? 80;
	const heightPercent = settings.textBoxHeight ?? 30;
	const gap = settings.textBoxGap ?? 20;
	const boxWidth = resolution.width * (widthPercent / 100);
	const boxHeight = resolution.height * (heightPercent / 100);
	const x = (resolution.width - boxWidth) / 2;
	const y = captionBoxY({
		primary,
		secondaryText,
		resolution,
		boxHeight,
		gap
	});
	context.save();
	drawBoxSurface(context, {
		x,
		y,
		boxWidth,
		boxHeight,
		settings,
		palette
	});
	drawBoxText(context, {
		text: self.einSofRenderer.applyCaptionGlitch(text, settings.enableTextGlitch),
		x,
		y,
		boxWidth,
		boxHeight
	});
	context.restore();
};

function captionBoxY(options) {
	if (!options.secondaryText) {
		return (options.resolution.height - options.boxHeight) / 2;
	}
	const stackHeight = options.boxHeight * 2 + options.gap;
	const startY = (options.resolution.height - stackHeight) / 2;
	return options.primary
		? startY
		: startY + options.boxHeight + options.gap;
}

function drawBoxSurface(context, options) {
	const boxColor = options.settings.randomizeBoxColorToggle
		? options.palette[4] || "#101018"
		: "#101018";
	const opacity = options.settings.textBoxOpacity ?? .75;
	context.fillStyle = self.einSofRenderer.hexToRgba(boxColor, opacity);
	context.fillRect(options.x, options.y, options.boxWidth, options.boxHeight);
	context.strokeStyle = options.palette[2] || "#FFFFFF";
	context.lineWidth = 2;
	context.strokeRect(options.x, options.y, options.boxWidth, options.boxHeight);
}

function drawBoxText(context, options) {
	const padding = 20;
	const innerWidth = Math.max(10, options.boxWidth - padding * 2);
	const innerHeight = Math.max(10, options.boxHeight - padding * 2);
	const layout = self.einSofRenderer.calculateOptimalLayout(
		context,
		options.text,
		innerWidth,
		innerHeight,
		"sans-serif"
	);
	context.fillStyle = "#FFFFFF";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.font = `bold ${layout.fontSize}px sans-serif`;
	context.shadowColor = "rgba(0, 0, 0, .9)";
	context.shadowBlur = 4;
	context.shadowOffsetX = 2;
	context.shadowOffsetY = 2;
	const totalHeight = layout.lines.length * layout.lineHeight;
	const startY = options.y + (options.boxHeight - totalHeight) / 2 + layout.lineHeight / 2;
	layout.lines.forEach((line, index) => {
		context.fillText(
			line,
			options.x + options.boxWidth / 2,
			startY + index * layout.lineHeight
		);
	});
}
