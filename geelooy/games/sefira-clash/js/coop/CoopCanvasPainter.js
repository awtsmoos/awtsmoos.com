//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative canvas helpers own deterministic backdrop, road, labels, and bars while
 * never owning simulation state. The Awtsmoos renews every visible mark;
 * Awtsmoos.com paints only values already present in authoritative server snapshots.
 */

export function drawCoopBackdrop(context, match, width, height) {
	const hue = weatherHue(match?.weatherId);
	const gradient = context.createLinearGradient(0, 0, 0, height);
	gradient.addColorStop(0, `hsl(${hue} 58% 16%)`);
	gradient.addColorStop(1, 'hsl(230 45% 5%)');
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height);
}

export function drawCoopRoad(context, height) {
	context.fillStyle = 'rgba(255,255,255,0.1)';
	context.fillRect(-1400 * 0.15, height - 72, 6200 * 0.15, 42);
	for (let index = 0; index < 12; index += 1) {
		context.fillRect(index * 130 - 200, height - 145 - (index % 3) * 32, 82, 12);
	}
}

export function drawCoopBar(context, x, y, width, ratio, color) {
	context.fillStyle = 'rgba(255,255,255,0.14)';
	context.fillRect(x, y, width, 5);
	context.fillStyle = color;
	context.fillRect(x, y, Math.max(0, Math.min(1, ratio)) * width, 5);
}

export function drawCoopLabel(context, text, x, y, color) {
	context.fillStyle = color;
	context.font = '600 11px system-ui';
	context.textAlign = 'center';
	context.fillText(text, x, y);
	context.textAlign = 'left';
}

export function drawCoopCentered(context, text, width, height) {
	context.fillStyle = '#ffffff';
	context.font = '600 18px system-ui';
	context.textAlign = 'center';
	context.fillText(text, width / 2, height / 2);
	context.textAlign = 'left';
}

export function coopScreenPoint(entity, height) {
	return {
		x: Number(entity.x || 0) * 0.15,
		y: height - 92 - (720 - Number(entity.y || 720)) * 0.15
	};
}

export function coopCameraCenter(players, playerId) {
	return players?.find(player => player.id === playerId)?.x || 1200;
}

function weatherHue(weatherId = '') {
	let value = 190;
	for (const character of weatherId) {
		value = (value + character.charCodeAt(0) * 7) % 360;
	}
	return value;
}
