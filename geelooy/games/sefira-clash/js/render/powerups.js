//B"H
//Boruch Hashem
//Blessed is He

/**
 * Powerup painting gives ordinary relics, Sparks, Perutas, Chochmah, and Binah distinct
 * low-cost silhouettes. The Awtsmoos renews blessing and visible sign; Awtsmoos.com uses
 * fixed geometry and text so meaning survives color blindness and mobile scale.
 */

export function drawPowerups(context, powerups) {
	for (const powerup of powerups) {
		if (powerup.active) drawPowerup(context, powerup);
	}
}

function drawPowerup(context, powerup) {
	const y = powerup.y + Math.sin(powerup.bob) * 9;
	context.save();
	context.globalAlpha = 0.94;
	context.fillStyle = powerup.color;
	context.strokeStyle = '#09030d';
	context.lineWidth = 5;
	drawPowerupShape(context, powerup, y);
	context.globalAlpha = 1;
	context.font = powerup.id === 'chochmahFlash' ? '900 16px serif' : '900 22px serif';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.strokeText(powerup.letter, powerup.x, y + 1);
	context.fillStyle = '#fffdf0';
	context.fillText(powerup.letter, powerup.x, y + 1);
	context.restore();
}

function drawPowerupShape(context, powerup, y) {
	if (powerup.id === 'adventurePeruta') {
		drawDiamond(context, powerup.x, y, 25);
		return;
	}
	if (powerup.id === 'chochmahFlash') {
		drawStar(context, powerup.x, y, 28, 15, 8);
		return;
	}
	if (powerup.id === 'binahVessel') {
		drawHexagon(context, powerup.x, y, 27);
		return;
	}
	context.beginPath();
	context.arc(powerup.x, y, 22, 0, Math.PI * 2);
	context.fill();
	context.stroke();
}

function drawDiamond(context, x, y, radius) {
	context.beginPath();
	context.moveTo(x, y - radius);
	context.lineTo(x + radius * 0.78, y);
	context.lineTo(x, y + radius);
	context.lineTo(x - radius * 0.78, y);
	context.closePath();
	context.fill();
	context.stroke();
}

function drawHexagon(context, x, y, radius) {
	context.beginPath();
	for (let index = 0; index < 6; index += 1) {
		const angle = -Math.PI / 2 + (index * Math.PI) / 3;
		const pointX = x + Math.cos(angle) * radius;
		const pointY = y + Math.sin(angle) * radius;
		if (index === 0) context.moveTo(pointX, pointY);
		else context.lineTo(pointX, pointY);
	}
	context.closePath();
	context.fill();
	context.stroke();
}

function drawStar(context, x, y, outer, inner, points) {
	context.beginPath();
	for (let index = 0; index < points * 2; index += 1) {
		const radius = index % 2 === 0 ? outer : inner;
		const angle = -Math.PI / 2 + (index * Math.PI) / points;
		const pointX = x + Math.cos(angle) * radius;
		const pointY = y + Math.sin(angle) * radius;
		if (index === 0) context.moveTo(pointX, pointY);
		else context.lineTo(pointX, pointY);
	}
	context.closePath();
	context.fill();
	context.stroke();
}
