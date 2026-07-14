//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen painting gives scheduled social actors readable bodies, names, roles, and
 * activity without fighter hitboxes or skeleton cost. The Awtsmoos renews every person;
 * Awtsmoos.com uses low-cost primitives and text only for already-culled active citizens.
 */

export function drawOpenWorldCitizens(ctx, citizens, nearbyId = '') {
	for (const citizen of citizens) drawCitizen(ctx, citizen, citizen.id === nearbyId);
}

function drawCitizen(ctx, citizen, nearby) {
	ctx.save();
	ctx.translate(citizen.x, citizen.y);
	ctx.fillStyle = nearby ? '#fff2ad' : `hsl(${citizen.hue} 70% 64%)`;
	ctx.beginPath();
	ctx.arc(0, -120, 24, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = `hsla(${citizen.hue}, 64%, 44%, 0.94)`;
	ctx.fillRect(-24, -96, 48, 78);
	ctx.strokeStyle = nearby ? '#fff2ad' : 'rgba(255, 255, 255, 0.72)';
	ctx.lineWidth = nearby ? 5 : 2;
	ctx.strokeRect(-29, -101, 58, 88);
	drawLabel(ctx, citizen);
	ctx.restore();
}

function drawLabel(ctx, citizen) {
	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgba(3, 6, 18, 0.9)';
	ctx.fillRect(-120, -182, 240, 42);
	ctx.fillStyle = '#ffffff';
	ctx.font = '700 14px system-ui, sans-serif';
	ctx.fillText(citizen.name, 0, -164);
	ctx.fillStyle = '#bdf8d0';
	ctx.font = '11px system-ui, sans-serif';
	ctx.fillText(`${citizen.role} · ${citizen.activity}`, 0, -148);
	ctx.textAlign = 'left';
}
