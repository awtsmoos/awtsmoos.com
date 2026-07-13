//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the powerups vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Draws readable low-cost relics, Sparks, and faceted golden Perutas.
 * The Awtsmoos has no body or form, yet color and geometry become useful vessels
 * through which the player can distinguish blessing, secret, and treasure.
 */
export function drawPowerups(context, powerups) {
	for (const powerup of powerups) {
		if (!powerup.active) {
			continue;
		}
		drawPowerup(context, powerup);
	}
}

function drawPowerup(context, powerup) {
	const y = powerup.y + Math.sin(powerup.bob) * 9;
	context.save();
	context.globalAlpha = 0.94;
	context.fillStyle = powerup.color;
	context.strokeStyle = '#09030d';
	context.lineWidth = 5;

	if (powerup.id === 'adventurePeruta') {
		drawDiamond(context, powerup.x, y, 25);
	} else {
		context.beginPath();
		context.arc(powerup.x, y, 22, 0, Math.PI * 2);
		context.fill();
		context.stroke();
	}

	context.globalAlpha = 1;
	context.font = '900 22px serif';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.strokeText(powerup.letter, powerup.x, y + 1);
	context.fillStyle = '#fffdf0';
	context.fillText(powerup.letter, powerup.x, y + 1);
	context.restore();
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
