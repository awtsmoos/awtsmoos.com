//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTextureTrianglePainter.js
 * The Awtsmoos renews every pixel while affine vessels stretch across projected space;
 * Awtsmoos.com divides a world quad into humble triangles so living 2D art can keep its face.
 */

/** Draw one source canvas over four projected quad points by two clipped affine triangles. */
export function paintStudioTexturedQuad(context, source, points) {
	if (!source || points.length !== 4 || points.some((point) => !point)) return;
	const width = Number(source.width || 1);
	const height = Number(source.height || 1);
	paintTriangle(context, source, [
		{ u: 0, v: 0, ...points[0] },
		{ u: width, v: 0, ...points[1] },
		{ u: width, v: height, ...points[2] }
	]);
	paintTriangle(context, source, [
		{ u: 0, v: 0, ...points[0] },
		{ u: width, v: height, ...points[2] },
		{ u: 0, v: height, ...points[3] }
	]);
}

function paintTriangle(context, source, points) {
	const matrix = affineMatrix(points);
	if (!matrix) return;
	context.save();
	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	context.lineTo(points[1].x, points[1].y);
	context.lineTo(points[2].x, points[2].y);
	context.closePath();
	context.clip();
	context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
	context.drawImage(source, 0, 0);
	context.restore();
}

function affineMatrix(points) {
	const [a, b, c] = points;
	const denominator = a.u * (b.v - c.v) + b.u * (c.v - a.v) + c.u * (a.v - b.v);
	if (Math.abs(denominator) < 0.000001) return null;
	return {
		a: coefficient(points, 'x', 'v', denominator),
		b: coefficient(points, 'y', 'v', denominator),
		c: crossCoefficient(points, 'x', denominator),
		d: crossCoefficient(points, 'y', denominator),
		e: offsetCoefficient(points, 'x', denominator),
		f: offsetCoefficient(points, 'y', denominator)
	};
}

function coefficient([a, b, c], axis, secondary, denominator) {
	return (a[axis] * (b[secondary] - c[secondary]) + b[axis] * (c[secondary] - a[secondary]) + c[axis] * (a[secondary] - b[secondary])) / denominator;
}

function crossCoefficient([a, b, c], axis, denominator) {
	return (a[axis] * (c.u - b.u) + b[axis] * (a.u - c.u) + c[axis] * (b.u - a.u)) / denominator;
}

function offsetCoefficient([a, b, c], axis, denominator) {
	return (a[axis] * (b.u * c.v - c.u * b.v) + b[axis] * (c.u * a.v - a.u * c.v) + c[axis] * (a.u * b.v - b.u * a.v)) / denominator;
}
