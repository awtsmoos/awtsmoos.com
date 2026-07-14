// B"H
// Boruch Hashem
// Blessed is He
import { visiblePeers } from '../multiplayer/state.js';

/** Draw the persistent arena: prey, rivals, live peers, and the local player. */
export function drawMap(canvas, world) {
	const context = canvas.getContext('2d');
	const width = canvas.width = Math.max(1, canvas.clientWidth * 2);
	const height = canvas.height = Math.max(1, canvas.clientHeight * 2);
	const scale = width / (world.level.bounds * 2.18);
	context.clearRect(0, 0, width, height);
	context.fillStyle = '#05030f';
	context.fillRect(0, 0, width, height);
	drawBoundary(context, width, height);
	drawObjects(context, width, height, scale, world);
	for (const rival of world.rivals) {
		if (rival.respawn > 0) continue;
		dot(
			context,
			point(width, rival.x, scale),
			point(height, rival.y, scale),
			Math.max(3, rival.r * scale),
			'#ff6b7a'
		);
	}
	for (const peer of visiblePeers(world)) {
		dot(
			context,
			point(width, peer.x, scale),
			point(height, peer.y, scale),
			Math.max(4, peer.r * scale),
			'#7edcff'
		);
	}
	dot(
		context,
		point(width, world.player.x, scale),
		point(height, world.player.y, scale),
		Math.max(5, world.player.r * scale),
		'#ffffff'
	);
}

function drawObjects(context, width, height, scale, world) {
	for (const object of world.level.objects) {
		if (object.taken) continue;
		const edible = object.r <= world.player.r * 0.72;
		const color = edible ? '#ffda63' : object.r > world.player.r ? '#614d80' : '#6da9ff';
		dot(
			context,
			point(width, object.x, scale),
			point(height, object.y, scale),
			edible ? 2.5 : 1.4,
			color
		);
	}
}

function drawBoundary(context, width, height) {
	context.strokeStyle = 'rgba(255,220,92,.55)';
	context.lineWidth = 3;
	context.beginPath();
	context.arc(width / 2, height / 2, width * 0.46, 0, Math.PI * 2);
	context.stroke();
}

function point(size, coordinate, scale) {
	return size / 2 + coordinate * scale;
}

function dot(context, x, y, radius, color) {
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.fill();
}
