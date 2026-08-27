/* B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews doors, traffic, weather, trains, gauges, and lanterns as
moving actors, while every held prop meets a visible hand and casts depth.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawEnvironmentObjects = function drawEnvironmentObjects(ctx, canvas, sequence, camera, timeMs) {
	const time = timeMs / 1000;
	const name = sequence.environment;
	if (name === 'hallway') {
		const door = Math.max(0, Math.sin(time * 2)) * 54;
		AnimatorVideo.roundRect(ctx, 510 + door, 82, 76, 224, 4, '#151f34');
		AnimatorVideo.ellipse(ctx, 524 + door, 194, 5, 5, '#ffd166');
	}
	if (name === 'cityStreet') {
		AnimatorVideo.drawTraffic(ctx, canvas, time, camera);
		AnimatorVideo.drawCloud(ctx, 88 + Math.sin(time * 0.4) * 72, 64, 1);
	}
	if (name === 'cityPark') {
		AnimatorVideo.drawTrees(ctx, time, camera);
	}
	if (name === 'rooftop') {
		AnimatorVideo.drawRain(ctx, canvas, time);
		if (Math.floor(time * 2) % 7 === 0) {
			AnimatorVideo.line(ctx, { x: 422, y: 18 }, { x: 382, y: 98 }, 5, '#f8fafc');
			AnimatorVideo.line(ctx, { x: 382, y: 98 }, { x: 430, y: 146 }, 5, '#c4a7ff');
		}
	}
	if (name === 'transitPlatform') {
		AnimatorVideo.drawTrain(ctx, canvas, time, camera);
	}
	if (['workshop', 'repairLab'].includes(name)) {
		AnimatorVideo.drawGauges(ctx, time);
	}
	if (name === 'festivalPlaza') {
		AnimatorVideo.drawLanterns(ctx, canvas, time);
	}
};

AnimatorVideo.drawTraffic = function drawTraffic(ctx, canvas, time, camera) {
	['#e63946', '#2563eb', '#f59e0b'].forEach((color, index) => {
		const x = (time * (52 + index * 14) + index * 210) % 820 - 120 + camera.panX * 0.25;
		const y = 248 + index * 10;
		AnimatorVideo.roundRect(ctx, x, y, 88, 30, 8, color);
		AnimatorVideo.ellipse(ctx, x + 18, y + 30, 9, 9, '#111827');
		AnimatorVideo.ellipse(ctx, x + 70, y + 30, 9, 9, '#111827');
	});
};

AnimatorVideo.drawTrees = function drawTrees(ctx, time, camera) {
	for (let index = 0; index < 6; index += 1) {
		const x = 60 + index * 104 + Math.sin(time * 1.2 + index) * 10 + camera.panX * 0.1;
		ctx.fillStyle = '#67412d';
		ctx.fillRect(x - 5, 122, 10, 112);
		AnimatorVideo.ellipse(ctx, x, 96 + Math.cos(time + index) * 4, 28, 24, index % 2 ? '#3fa34d' : '#59b967');
	}
};

AnimatorVideo.drawRain = function drawRain(ctx, canvas, time) {
	for (let index = 0; index < 36; index += 1) {
		const x = (index * 53 + time * 126) % (canvas.width + 60) - 30;
		const y = (index * 37 + time * 185) % canvas.height;
		AnimatorVideo.line(ctx, { x, y }, { x: x - 10, y: y + 20 }, 2, '#a5d8ff');
	}
};

AnimatorVideo.drawTrain = function drawTrain(ctx, canvas, time, camera) {
	const x = 700 - (time * 90 % 1120) + camera.panX * 0.2;
	AnimatorVideo.roundRect(ctx, x, 178, 500, 106, 12, '#d7dee8');
	for (let index = 0; index < 6; index += 1) {
		AnimatorVideo.roundRect(ctx, x + 28 + index * 76, 198, 50, 34, 4, '#183d61');
	}
};

AnimatorVideo.drawGauges = function drawGauges(ctx, time) {
	for (let index = 0; index < 4; index += 1) {
		const x = 136 + index * 122;
		AnimatorVideo.ellipse(ctx, x, 116, 30, 30, '#101827');
		AnimatorVideo.ellipse(ctx, x, 116, 24, 24, '#edf6ff');
		AnimatorVideo.line(ctx, { x, y: 116 }, { x: x + Math.cos(time * (0.8 + index * 0.12)) * 20, y: 116 + Math.sin(time) * 14 }, 3, '#e63946');
	}
};

AnimatorVideo.drawLanterns = function drawLanterns(ctx, canvas, time) {
	for (let index = 0; index < 18; index += 1) {
		const x = 28 + index * 36;
		const y = 58 + Math.sin(time * 1.4 + index * 0.7) * 16;
		AnimatorVideo.line(ctx, { x, y: 0 }, { x, y: y - 7 }, 1, '#f8fafc');
		AnimatorVideo.ellipse(ctx, x, y, 8, 10, index % 3 ? '#ffc857' : '#ff6b6b');
	}
};

AnimatorVideo.drawCloud = function drawCloud(ctx, x, y, scale) {
	AnimatorVideo.ellipse(ctx, x, y, 22 * scale, 18 * scale, '#f8fafc');
	AnimatorVideo.ellipse(ctx, x + 24 * scale, y - 8 * scale, 28 * scale, 23 * scale, '#f8fafc');
	AnimatorVideo.ellipse(ctx, x + 52 * scale, y, 22 * scale, 18 * scale, '#f8fafc');
};
