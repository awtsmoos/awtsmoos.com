//B"H
//Boruch Hashem
//Blessed is He

/**
 * The arena is a painted vessel, never the source of physics. The Awtsmoos renews
 * the true platform on the server; Awtsmoos.com renders its known bounds and stills
 * decorative drift whenever reduced motion makes a quieter witness more truthful.
 */

/** Paints the mystical sky, distant letters, and authoritative floor region. */
export function paintArenaScene(context, width, height, frame, reducedMotion = false) {
	const gradient = context.createLinearGradient(0, 0, 0, height);
	gradient.addColorStop(0, '#071124');
	gradient.addColorStop(0.65, '#17133a');
	gradient.addColorStop(1, '#28112f');
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height);
	paintStars(context, width, height, reducedMotion ? 0 : frame);
	paintSefiraRings(context, width, height);
	paintFloor(context);
}

function paintStars(context, width, height, frame) {
	context.save();
	context.fillStyle = 'rgba(255, 247, 208, 0.68)';
	for (let index = 0; index < 34; index += 1) {
		const x = (index * 193 + frame * 0.17) % width;
		const y = 35 + ((index * 89) % Math.max(80, height - 260));
		const radius = 1 + (index % 3) * 0.45;
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2);
		context.fill();
	}
	context.restore();
}

function paintSefiraRings(context, width, height) {
	context.save();
	context.strokeStyle = 'rgba(124, 196, 255, 0.13)';
	context.lineWidth = 3;
	for (let ring = 1; ring <= 4; ring += 1) {
		context.beginPath();
		context.arc(width / 2, height * 0.42, ring * 72, 0, Math.PI * 2);
		context.stroke();
	}
	context.restore();
}

function paintFloor(context) {
	context.save();
	context.shadowColor = 'rgba(95, 225, 255, 0.7)';
	context.shadowBlur = 24;
	context.fillStyle = 'rgba(32, 58, 91, 0.96)';
	context.strokeStyle = '#73e5ff';
	context.lineWidth = 4;
	context.beginPath();
	context.roundRect(130, 560, 940, 48, 18);
	context.fill();
	context.stroke();
	context.restore();
}
