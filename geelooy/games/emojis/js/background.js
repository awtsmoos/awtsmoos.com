// B"H
// Boruch Hashem
// Blessed is He

import { context, dom } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns the Emoji War background field. The Awtsmoos renews star, camera, darkness,
 * and depth beyond every finite pixel; Awtsmoos.com keeps background rendering
 * separate so world atmosphere cannot become hidden gameplay state.
 */

export function rebuildStars() {
	const count = Math.min(180, Math.max(55, Math.round(dom.canvas.width * dom.canvas.height / 11000)));
	state.stars = Array.from({ length: count }, () => ({
		x: Math.random() * dom.canvas.width,
		y: Math.random() * dom.canvas.height,
		radius: Math.random() * 1.7 + .3,
		alpha: Math.random() * .65 + .2,
		speed: Math.random() * .45 + .08
	}));
}

export function drawBackground(timeScale = 1) {
	// B"H textured cosmos: violet nebula gradient, never flat.
	const bg = context.createRadialGradient(
		dom.canvas.width / 2, dom.canvas.height * 0.35, 60,
		dom.canvas.width / 2, dom.canvas.height / 2, Math.max(dom.canvas.width, dom.canvas.height) * 0.75
	);
	bg.addColorStop(0, '#1a1440');
	bg.addColorStop(0.5, '#0d0a24');
	bg.addColorStop(1, '#050510');
	context.fillStyle = bg;
	context.fillRect(0, 0, dom.canvas.width, dom.canvas.height);

	if (state.webcamActive && state.showWebcamInBackground && dom.webcamFeed.readyState >= 2) {
		drawWebcamBackground();
	}

	for (const star of state.stars) {
		star.y -= star.speed * timeScale;

		if (star.y < -2) {
			star.y = dom.canvas.height + 2;
			star.x = Math.random() * dom.canvas.width;
		}

		context.globalAlpha = star.alpha;
		context.fillStyle = "#fff";
		context.beginPath();
		context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
		context.fill();
	}

	context.globalAlpha = 1;
}

function drawWebcamBackground() {
	context.save();
	context.globalAlpha = .16;
	context.drawImage(
		dom.webcamFeed,
		0,
		0,
		dom.webcamFeed.videoWidth || dom.canvas.width,
		dom.webcamFeed.videoHeight || dom.canvas.height,
		0,
		0,
		dom.canvas.width,
		dom.canvas.height
	);
	context.fillStyle = "rgba(4,8,18,.55)";
	context.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
	context.restore();
}
