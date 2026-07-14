//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition atmosphere lets city, forest, and climax identity reach the battlefield
 * without replacing handcrafted geometry. The Awtsmoos renews every horizon;
 * Awtsmoos.com paints restrained silhouettes from authoritative region metadata.
 */

export function drawExpeditionAtmosphere(ctx, expedition, width, height) {
	if (!expedition?.locationKind) {
		return;
	}
	ctx.save();
	ctx.globalAlpha = 0.2;
	ctx.fillStyle = `hsl(${expedition.regionHue} 58% 34%)`;
	if (expedition.locationKind === 'settlement') {
		drawCity(ctx, width, height);
	}
	if (expedition.locationKind === 'wilderness') {
		drawForest(ctx, width, height);
	}
	if (expedition.locationKind === 'climax') {
		drawSanctum(ctx, width, height);
	}
	ctx.restore();
}

function drawCity(ctx, width, height) {
	const baseline = height * 0.78;
	for (let index = 0; index < 15; index += 1) {
		const buildingWidth = width / 13;
		const x = index * buildingWidth - buildingWidth * 0.4;
		const towerHeight = 50 + ((index * 37) % 120);
		ctx.fillRect(x, baseline - towerHeight, buildingWidth * 0.72, towerHeight);
		if (index % 3 === 0) {
			ctx.beginPath();
			ctx.moveTo(x, baseline - towerHeight);
			ctx.lineTo(x + buildingWidth * 0.36, baseline - towerHeight - 28);
			ctx.lineTo(x + buildingWidth * 0.72, baseline - towerHeight);
			ctx.fill();
		}
	}
}

function drawForest(ctx, width, height) {
	const baseline = height * 0.82;
	for (let index = 0; index < 18; index += 1) {
		const x = (index + 0.5) * (width / 18);
		const treeHeight = 70 + ((index * 29) % 110);
		ctx.fillRect(x - 5, baseline - treeHeight * 0.55, 10, treeHeight * 0.55);
		ctx.beginPath();
		ctx.arc(x, baseline - treeHeight, 34 + (index % 3) * 8, 0, Math.PI * 2);
		ctx.fill();
	}
}

function drawSanctum(ctx, width, height) {
	const centerX = width / 2;
	const baseline = height * 0.82;
	ctx.fillRect(centerX - width * 0.32, baseline - 28, width * 0.64, 28);
	for (const direction of [-1, 1]) {
		ctx.fillRect(centerX + direction * width * 0.25 - 16, baseline - 190, 32, 190);
		ctx.beginPath();
		ctx.arc(centerX + direction * width * 0.25, baseline - 190, 38, Math.PI, 0);
		ctx.fill();
	}
	ctx.beginPath();
	ctx.arc(centerX, baseline - 20, width * 0.18, Math.PI, 0);
	ctx.strokeStyle = ctx.fillStyle;
	ctx.lineWidth = 14;
	ctx.stroke();
}
