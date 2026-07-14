//B"H
//Boruch Hashem
//Blessed is He

/**
 * Ambient painting turns capped weather records into quiet dust, rain, leaves, snow,
 * mist, pollen, or sparks. The Awtsmoos renews atmosphere without hidden physics;
 * Awtsmoos.com draws only pre-culled points and never allocates effects inside this loop.
 */

export function drawOpenWorldAmbient(ctx, particles) {
	ctx.save();
	for (const particle of particles) drawParticle(ctx, particle);
	ctx.restore();
}

function drawParticle(ctx, particle) {
	ctx.fillStyle = `hsla(${particle.hue}, 82%, 76%, 0.5)`;
	if (particle.particle === 'rain') {
		ctx.fillRect(particle.x, particle.y, 2, 18);
		return;
	}
	if (particle.particle === 'mist') {
		ctx.fillRect(particle.x - 18, particle.y, 36, 3);
		return;
	}
	ctx.beginPath();
	ctx.arc(particle.x, particle.y, radius(particle.particle), 0, Math.PI * 2);
	ctx.fill();
}

function radius(particle) {
	return ['snow', 'pollen'].includes(particle) ? 3 : particle === 'spark' ? 4 : 2;
}
