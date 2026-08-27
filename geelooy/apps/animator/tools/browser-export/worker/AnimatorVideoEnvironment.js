/* B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews eight worlds with distinct atmosphere, architecture, light,
and depth. Awtsmoos.com separates true interiors from open exterior horizons.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.environmentPalette = function environmentPalette(name) {
	return {
		workshop: ['#111a31', '#344865', '#a96b3f', '#ffd166'],
		hallway: ['#202d49', '#667792', '#2a3446', '#ff7a59'],
		cityStreet: ['#6fc5ef', '#d9eff9', '#515d6e', '#ffd166'],
		cityPark: ['#87d0ed', '#c7edcf', '#438c54', '#ff9f1c'],
		rooftop: ['#231d3d', '#625478', '#282d3b', '#c4a7ff'],
		transitPlatform: ['#27334a', '#7d8da3', '#303844', '#43c6ac'],
		repairLab: ['#101629', '#303d59', '#222938', '#00e5ff'],
		festivalPlaza: ['#0c1028', '#342b64', '#403151', '#ffc857']
	}[name] || ['#172033', '#52617a', '#242c38', '#f59e0b'];
};

AnimatorVideo.drawEnvironment = function drawEnvironment(ctx, canvas, sequence, camera, timeMs) {
	const colors = AnimatorVideo.environmentPalette(sequence.environment);
	const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
	sky.addColorStop(0, colors[0]);
	sky.addColorStop(1, colors[1]);
	ctx.fillStyle = sky;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (sequence.environmentType === 'interior') {
		AnimatorVideo.drawInterior(ctx, canvas, sequence, camera, colors);
	} else {
		AnimatorVideo.drawExterior(ctx, canvas, sequence, camera, colors, timeMs);
	}
	AnimatorVideo.drawEnvironmentObjects(ctx, canvas, sequence, camera, timeMs);
};

AnimatorVideo.drawInterior = function drawInterior(ctx, canvas, sequence, camera, colors) {
	const horizon = camera.horizon;
	ctx.fillStyle = colors[1];
	ctx.fillRect(0, 58, canvas.width, horizon - 58);
	for (let index = 0; index < 6; index += 1) {
		const x = 26 + index * 104 + camera.panX * 0.12;
		ctx.fillStyle = index % 2 ? colors[0] : AnimatorVideo.mixColor(colors[0], '#ffffff', 0.08);
		ctx.fillRect(x, 88, 72, Math.max(70, horizon - 108));
		ctx.fillStyle = colors[3];
		ctx.fillRect(x + 8, 98, 4, 32);
	}
	AnimatorVideo.drawPerspectiveFloor(ctx, canvas, horizon, colors[2], colors[3]);
	if (['workshop', 'repairLab'].includes(sequence.environment)) {
		ctx.fillStyle = '#68452e';
		ctx.fillRect(48, horizon + 28, 544, 34);
		ctx.fillStyle = '#3a271d';
		ctx.fillRect(72, horizon + 62, 16, 64);
		ctx.fillRect(552, horizon + 62, 16, 64);
	}
};

AnimatorVideo.drawExterior = function drawExterior(ctx, canvas, sequence, camera, colors, timeMs) {
	const horizon = camera.horizon;
	const sunX = 518 + Math.sin(timeMs / 18000) * 36 + camera.panX * 0.05;
	if (!['rooftop', 'festivalPlaza'].includes(sequence.environment)) {
		AnimatorVideo.withAlpha(ctx, 0.84, () => {
			AnimatorVideo.ellipse(ctx, sunX, 55, 27, 27, colors[3]);
		});
	}
	for (let layer = 0; layer < 3; layer += 1) {
		const depth = 0.08 + layer * 0.09;
		const baseY = horizon - 18 + layer * 12;
		for (let index = 0; index < 9; index += 1) {
			const height = 34 + (index * 17 + layer * 23) % 78;
			const x = index * 82 - 18 + camera.panX * depth;
			ctx.fillStyle = AnimatorVideo.mixColor(colors[1], colors[0], 0.18 + layer * 0.2);
			ctx.fillRect(x, baseY - height, 68, height);
		}
	}
	AnimatorVideo.drawPerspectiveFloor(ctx, canvas, horizon, colors[2], colors[3]);
};

AnimatorVideo.drawPerspectiveFloor = function drawPerspectiveFloor(ctx, canvas, horizon, floor, accent) {
	ctx.fillStyle = floor;
	ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);
	AnimatorVideo.withAlpha(ctx, 0.22, () => {
		for (let index = -5; index <= 5; index += 1) {
			AnimatorVideo.line(ctx, { x: canvas.width / 2, y: horizon }, { x: canvas.width / 2 + index * 96, y: canvas.height }, 1, accent);
		}
		for (let row = 1; row < 6; row += 1) {
			const y = horizon + (canvas.height - horizon) * (row / 6) ** 1.65;
			AnimatorVideo.line(ctx, { x: 0, y }, { x: canvas.width, y }, 1, accent);
		}
	});
};
