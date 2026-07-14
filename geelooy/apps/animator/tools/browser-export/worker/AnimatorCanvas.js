/* B"H
Boruch Hashem
Blessed is He

Small Canvas2D vessels reveal depth, cloth, face, weather, and light in the
Awtsmoos.com browser-rendered movie.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.roundRect = function roundRect(ctx, x, y, width, height, radius, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2));
	ctx.fill();
};

AnimatorVideo.ellipse = function ellipse(ctx, x, y, radiusX, radiusY, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.ellipse(x, y, Math.max(0.1, radiusX), Math.max(0.1, radiusY), 0, 0, Math.PI * 2);
	ctx.fill();
};

AnimatorVideo.line = function line(ctx, start, end, width, color) {
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.beginPath();
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.stroke();
};

AnimatorVideo.polygon = function polygon(ctx, points, color, stroke = null) {
	ctx.fillStyle = color;
	ctx.beginPath();
	points.forEach((point, index) => {
		if (index === 0) {
			ctx.moveTo(point.x, point.y);
		} else {
			ctx.lineTo(point.x, point.y);
		}
	});
	ctx.closePath();
	ctx.fill();
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
};

AnimatorVideo.withAlpha = function withAlpha(ctx, alpha, draw) {
	ctx.save();
	ctx.globalAlpha = alpha;
	draw();
	ctx.restore();
};

AnimatorVideo.mixColor = function mixColor(first, second, amount) {
	const parse = value => [1, 3, 5].map(index => Number.parseInt(value.slice(index, index + 2), 16));
	const a = parse(first);
	const b = parse(second);
	const parts = a.map((value, index) => Math.round(value + (b[index] - value) * amount));
	return `#${parts.map(value => value.toString(16).padStart(2, '0')).join('')}`;
};
