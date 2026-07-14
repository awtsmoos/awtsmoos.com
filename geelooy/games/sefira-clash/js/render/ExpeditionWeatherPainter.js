//B"H
//Boruch Hashem
//Blessed is He

/**
 * Weather painting turns deterministic world state into visible light and motion.
 * The Awtsmoos renews sky and particle together; Awtsmoos.com paints named conditions
 * from frame math alone, never changing movement or hiding gameplay behind atmosphere.
 */

export function drawExpeditionWeather(ctx, expedition, width, height) {
	const weather = expedition?.weather;
	if (!weather) return;
	ctx.save();
	drawTimeLight(ctx, weather.time, width, height);
	ctx.fillStyle = `hsla(${weather.hue}, 72%, 54%, ${weather.opacity})`;
	ctx.fillRect(0, 0, width, height);
	drawWeatherParticles(ctx, weather, expedition.weatherFrame || 0, width, height);
	ctx.restore();
}

function drawTimeLight(ctx, time, width, height) {
	const darkness = Math.max(0, 1 - Number(time?.light || 1));
	if (darkness <= 0) return;
	ctx.fillStyle = `rgba(2, 4, 16, ${darkness * 0.72})`;
	ctx.fillRect(0, 0, width, height);
}

function drawWeatherParticles(ctx, weather, frame, width, height) {
	const count = Math.max(8, Math.min(42, Math.round((18 / weather.cadence) * 18)));
	ctx.globalAlpha = 0.45;
	ctx.strokeStyle = `hsl(${weather.hue} 86% 76%)`;
	ctx.fillStyle = ctx.strokeStyle;
	for (let index = 0; index < count; index += 1) {
		const x = seededPosition(index * 31 + frame * 0.7, width);
		const y = seededPosition(index * 53 + frame * 1.4, height);
		drawParticle(ctx, weather.particle, x, y, index);
	}
}

function drawParticle(ctx, particle, x, y, index) {
	if (['rain', 'streak', 'spray'].includes(particle)) {
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x - 6, y + 16 + (index % 8));
		ctx.stroke();
		return;
	}
	if (['mist', 'void', 'ray'].includes(particle)) {
		ctx.fillRect(x, y, 32 + (index % 26), 2 + (index % 4));
		return;
	}
	ctx.beginPath();
	ctx.arc(x, y, 2 + (index % 4), 0, Math.PI * 2);
	ctx.fill();
}

function seededPosition(seed, size) {
	return (Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1) * size;
}
