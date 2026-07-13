// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerGeometry.js
 * @description Shares petal placement mathematics between every flower form,
 * allowing many crowns to receive one orderly light from the Awtsmoos.
 */
export function appendPetalRing(buffer, context, count, radius, phase, lift = 0) {
	const center = botanicalTop(context);
	for (let index = 0; index < count; index += 1) {
		const angle = index / count * Math.PI * 2 + phase;
		const direction = [Math.cos(angle), Math.sin(angle)];
		const tangent = [-direction[1], direction[0]];
		const width = radius * 0.32;
		buffer.addQuad([
			[center[0], center[1], center[2]],
			[
				center[0] + direction[0] * radius * 0.48 + tangent[0] * width,
				center[1] + lift * 0.45,
				center[2] + direction[1] * radius * 0.48 + tangent[1] * width
			],
			[
				center[0] + direction[0] * radius,
				center[1] + lift,
				center[2] + direction[1] * radius
			],
			[
				center[0] + direction[0] * radius * 0.48 - tangent[0] * width,
				center[1] + lift * 0.45,
				center[2] + direction[1] * radius * 0.48 - tangent[1] * width
			]
		]);
	}
}

export function botanicalDetailCount(context, requested, minimum) {
	return Math.max(minimum, Math.round(requested * context.quality.detail));
}

export function botanicalTop(context) {
	return [context.origin.x, context.origin.y + context.height, context.origin.z];
}

export function botanicalOffset(context, angle, radius, heightFraction) {
	return [
		context.origin.x + Math.cos(angle) * radius,
		context.origin.y + context.height * heightFraction,
		context.origin.z + Math.sin(angle) * radius
	];
}
