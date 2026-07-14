/* B"H
Boruch Hashem
Blessed is He

World, camera, actors, objects, dialogue, and editorial evidence meet in one
ordered browser frame. The Awtsmoos renews every visible relationship.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawFrame = function drawFrame(workerContext, framePayload) {
	const { ctx, canvas } = workerContext;
	const timeMs = framePayload.time * 1000;
	const shot = AnimatorVideo.activeShot(timeMs);
	const sequence = AnimatorVideo.activeSequence(shot);
	const dialogue = AnimatorVideo.activeDialogue(timeMs);
	const camera = AnimatorVideo.camera(shot, timeMs);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(camera.rotation);
	ctx.translate(-canvas.width / 2, -canvas.height / 2);
	AnimatorVideo.drawEnvironment(ctx, canvas, sequence, camera, timeMs);
	AnimatorVideo.drawCast(ctx, canvas, shot, dialogue, camera, timeMs);
	ctx.restore();
	AnimatorVideo.drawForegroundLight(ctx, canvas, sequence, timeMs);
	if (dialogue?.bubble) {
		AnimatorVideo.drawDialogue(ctx, canvas, dialogue);
	}
	AnimatorVideo.drawSlate(ctx, canvas, sequence, shot, timeMs);
};

AnimatorVideo.drawForegroundLight = function drawForegroundLight(ctx, canvas, sequence, timeMs) {
	const gradient = ctx.createRadialGradient(
		canvas.width * 0.5,
		canvas.height * 0.42,
		60,
		canvas.width * 0.5,
		canvas.height * 0.5,
		canvas.width * 0.68
	);
	gradient.addColorStop(0, 'rgba(255,255,255,0)');
	gradient.addColorStop(1, sequence.environment === 'festivalPlaza'
		? 'rgba(25,8,48,0.26)'
		: 'rgba(0,0,0,0.24)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (sequence.environment === 'festivalPlaza') {
		AnimatorVideo.withAlpha(ctx, 0.12 + Math.sin(timeMs / 270) * 0.03, () => {
			ctx.fillStyle = '#ffc857';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		});
	}
};

AnimatorVideo.drawDialogue = function drawDialogue(ctx, canvas, dialogue) {
	const margin = 22;
	AnimatorVideo.withAlpha(ctx, 0.96, () => {
		AnimatorVideo.roundRect(ctx, margin, margin, canvas.width - margin * 2, 62, 14, '#fffdf4');
	});
	ctx.strokeStyle = '#111827';
	ctx.lineWidth = 3;
	ctx.strokeRect(margin, margin, canvas.width - margin * 2, 62);
	ctx.fillStyle = '#111827';
	ctx.font = '700 14px system-ui, sans-serif';
	ctx.fillText(`${dialogue.speakerName}:`, margin + 14, margin + 22);
	ctx.font = '600 13px system-ui, sans-serif';
	AnimatorVideo.wrapText(ctx, dialogue.text, margin + 14, margin + 42, canvas.width - margin * 2 - 28, 16);
};

AnimatorVideo.wrapText = function wrapText(ctx, text, x, y, width, lineHeight) {
	const words = String(text).split(/\s+/u);
	let line = '';
	let lineY = y;
	for (const word of words) {
		const candidate = line ? `${line} ${word}` : word;
		if (ctx.measureText(candidate).width > width && line) {
			ctx.fillText(line, x, lineY);
			line = word;
			lineY += lineHeight;
		} else {
			line = candidate;
		}
	}
	ctx.fillText(line, x, lineY);
};

AnimatorVideo.drawSlate = function drawSlate(ctx, canvas, sequence, shot, timeMs) {
	AnimatorVideo.withAlpha(ctx, 0.82, () => {
		AnimatorVideo.roundRect(ctx, 10, canvas.height - 30, 452, 22, 5, '#050713');
	});
	ctx.fillStyle = '#f8fafc';
	ctx.font = '600 10px ui-monospace, monospace';
	ctx.fillText(`${sequence.name} / ${shot.camera.size} ${shot.camera.angle}`, 16, canvas.height - 15);
	const totalSeconds = Math.floor(timeMs / 1000);
	const clock = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
	ctx.textAlign = 'right';
	ctx.fillText(clock, canvas.width - 16, canvas.height - 15);
	ctx.textAlign = 'left';
};
