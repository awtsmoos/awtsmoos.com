/* B"H
Boruch Hashem
Blessed is He

A prop becomes performance when its handle, weight, face, and shadow meet the
character's hand. The Awtsmoos renews ten original objects as readable forms.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.drawHeldProp = function drawHeldProp(ctx, name, hand, anatomy, timeMs) {
	if (!name) {
		return;
	}
	const scale = anatomy.scale;
	ctx.save();
	ctx.translate(hand.x, hand.y);
	ctx.rotate(Math.sin(timeMs / 460 + hand.x) * 0.04);
	AnimatorVideo.withAlpha(ctx, 0.24, () => {
		AnimatorVideo.ellipse(ctx, 9 * scale, 20 * scale, 20 * scale, 5 * scale, '#000000');
	});
	const painter = {
		forecastTablet: AnimatorVideo.propTablet,
		umbrella: AnimatorVideo.propUmbrella,
		signalCard: AnimatorVideo.propSignal,
		meetingCards: AnimatorVideo.propCards,
		pressureGauge: AnimatorVideo.propGauge,
		arrivalDisplay: AnimatorVideo.propDisplay,
		toolbox: AnimatorVideo.propToolbox,
		nothingButton: AnimatorVideo.propButton,
		lantern: AnimatorVideo.propLantern,
		freeTimeCard: AnimatorVideo.propFreeTime
	}[name] || AnimatorVideo.propPaper;
	painter(ctx, scale);
	ctx.restore();
};

AnimatorVideo.propTablet = function propTablet(ctx, scale) {
	AnimatorVideo.roundRect(ctx, -6 * scale, -14 * scale, 42 * scale, 30 * scale, 4 * scale, '#111827');
	AnimatorVideo.roundRect(ctx, -2 * scale, -10 * scale, 34 * scale, 22 * scale, 2 * scale, '#00d4ff');
	AnimatorVideo.line(ctx, { x: 4 * scale, y: 7 * scale }, { x: 26 * scale, y: -4 * scale }, 2 * scale, '#ffffff');
};

AnimatorVideo.propUmbrella = function propUmbrella(ctx, scale) {
	AnimatorVideo.line(ctx, { x: 8 * scale, y: 0 }, { x: 8 * scale, y: 54 * scale }, 4 * scale, '#111827');
	ctx.fillStyle = '#7c3aed';
	ctx.beginPath();
	ctx.arc(8 * scale, 0, 31 * scale, Math.PI, Math.PI * 2);
	ctx.fill();
	AnimatorVideo.line(ctx, { x: 8 * scale, y: 54 * scale }, { x: 17 * scale, y: 60 * scale }, 3 * scale, '#111827');
};

AnimatorVideo.propSignal = function propSignal(ctx, scale) {
	AnimatorVideo.roundRect(ctx, -3 * scale, -15 * scale, 28 * scale, 46 * scale, 4 * scale, '#111827');
	['#e63946', '#ffd166', '#22c55e'].forEach((color, index) => {
		AnimatorVideo.ellipse(ctx, 11 * scale, (-5 + index * 13) * scale, 6 * scale, 6 * scale, color);
	});
};

AnimatorVideo.propCards = function propCards(ctx, scale) {
	for (let index = 0; index < 3; index += 1) {
		ctx.save();
		ctx.rotate((index - 1) * 0.18);
		AnimatorVideo.roundRect(ctx, index * 4 * scale, -10 * scale, 30 * scale, 20 * scale, 2 * scale, '#f8fafc');
		AnimatorVideo.line(ctx, { x: (5 + index * 4) * scale, y: -2 * scale }, { x: (24 + index * 4) * scale, y: -2 * scale }, 2 * scale, '#7c3aed');
		ctx.restore();
	}
};

AnimatorVideo.propGauge = function propGauge(ctx, scale) {
	AnimatorVideo.ellipse(ctx, 10 * scale, 0, 19 * scale, 19 * scale, '#111827');
	AnimatorVideo.ellipse(ctx, 10 * scale, 0, 15 * scale, 15 * scale, '#f8fafc');
	AnimatorVideo.line(ctx, { x: 10 * scale, y: 0 }, { x: 20 * scale, y: -10 * scale }, 3 * scale, '#e63946');
};

AnimatorVideo.propDisplay = function propDisplay(ctx, scale) {
	AnimatorVideo.roundRect(ctx, -4 * scale, -12 * scale, 68 * scale, 28 * scale, 3 * scale, '#111827');
	ctx.fillStyle = '#43c6ac';
	ctx.font = `${Math.max(8, 9 * scale)}px ui-monospace, monospace`;
	ctx.fillText('WHENEVER', 3 * scale, 6 * scale);
};

AnimatorVideo.propToolbox = function propToolbox(ctx, scale) {
	AnimatorVideo.roundRect(ctx, -4 * scale, -4 * scale, 48 * scale, 28 * scale, 4 * scale, '#e63946');
	AnimatorVideo.roundRect(ctx, 10 * scale, -13 * scale, 20 * scale, 13 * scale, 3 * scale, '#111827');
	AnimatorVideo.roundRect(ctx, 18 * scale, 7 * scale, 8 * scale, 6 * scale, 2 * scale, '#ffd166');
};

AnimatorVideo.propButton = function propButton(ctx, scale) {
	AnimatorVideo.roundRect(ctx, -2 * scale, -10 * scale, 46 * scale, 26 * scale, 5 * scale, '#111827');
	AnimatorVideo.ellipse(ctx, 21 * scale, 3 * scale, 9 * scale, 9 * scale, '#00e5ff');
};

AnimatorVideo.propLantern = function propLantern(ctx, scale) {
	AnimatorVideo.line(ctx, { x: 16 * scale, y: -18 * scale }, { x: 16 * scale, y: -8 * scale }, 2 * scale, '#f8fafc');
	AnimatorVideo.roundRect(ctx, 4 * scale, -8 * scale, 24 * scale, 36 * scale, 5 * scale, '#111827');
	AnimatorVideo.roundRect(ctx, 8 * scale, -4 * scale, 16 * scale, 28 * scale, 4 * scale, '#ffc857');
};

AnimatorVideo.propFreeTime = function propFreeTime(ctx, scale) {
	AnimatorVideo.roundRect(ctx, -3 * scale, -12 * scale, 48 * scale, 36 * scale, 3 * scale, '#f8fafc');
	ctx.fillStyle = '#ff6b6b';
	ctx.fillRect(-3 * scale, -12 * scale, 48 * scale, 10 * scale);
	ctx.fillStyle = '#111827';
	ctx.font = `${Math.max(8, 9 * scale)}px ui-monospace, monospace`;
	ctx.fillText('FREE', 8 * scale, 13 * scale);
};

AnimatorVideo.propPaper = function propPaper(ctx, scale) {
	AnimatorVideo.roundRect(ctx, -3 * scale, -10 * scale, 38 * scale, 27 * scale, 3 * scale, '#f8fafc');
	AnimatorVideo.line(ctx, { x: 3 * scale, y: -2 * scale }, { x: 28 * scale, y: -2 * scale }, 2 * scale, '#111827');
};
