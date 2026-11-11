// B"H
// Star Collector — renderer: backdrop stars, entities, ship.
window.SC = window.SC || {};

function createBackdrop(state) {
	var dots = [];
	for (var i = 0; i < 70; i++) {
		dots.push({
			x: Math.random() * state.width,
			y: Math.random() * state.height,
			r: Math.random() * 1.6 + 0.4,
			s: 12 + Math.random() * 30
		});
	}
	return dots;
}

function drawFrame(ctx, state, backdrop) {
	ctx.clearRect(0, 0, state.width, state.height);
	ctx.fillStyle = "#a9c6ff";
	for (var i = 0; i < backdrop.length; i++) {
		var d = backdrop[i];
		ctx.globalAlpha = 0.35 + (d.r - 0.4) / 1.6 * 0.5;
		ctx.beginPath();
		ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
	var j;
	for (j = 0; j < state.stars.length; j++) state.stars[j].draw(ctx);
	for (j = 0; j < state.meteors.length; j++) state.meteors[j].draw(ctx);
	// Ship blinks while invincible.
	if (state.ship && !(state.invincible > 0 && Math.floor(state.invincible * 12) % 2 === 0)) {
		state.ship.draw(ctx);
	}
}

function scrollBackdrop(backdrop, state, dt) {
	for (var i = 0; i < backdrop.length; i++) {
		var d = backdrop[i];
		d.y += d.s * dt;
		if (d.y > state.height + 2) { d.y = -2; d.x = Math.random() * state.width; }
	}
}

SC.createBackdrop = createBackdrop;
SC.drawFrame = drawFrame;
SC.scrollBackdrop = scrollBackdrop;
