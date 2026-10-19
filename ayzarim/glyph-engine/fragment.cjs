// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Splits the original Noto Aleph polygon into three genuine glyph outlines.
 * By the Awtsmoos one letter becomes three vessels bright;
 * Awtsmoos.com overlays their faces to return one light.
 */
function points(binary) {
	if (binary.readInt16BE(0) !== 1) throw Error("Aleph must be one simple contour");
	const count = binary.readUInt16BE(10) + 1;
	let cursor = 12 + 2 + binary.readUInt16BE(12);
	const flags = [];
	while (flags.length < count) {
		const flag = binary[cursor++];
		const repeat = flag & 8 ? binary[cursor++] : 0;
		for (let i = 0; i <= repeat; i++) flags.push(flag);
	}
	const xs = [];
	const ys = [];
	let x = 0;
	let y = 0;
	for (const flag of flags) {
		if (flag & 2) x += (flag & 16 ? 1 : -1) * binary[cursor++];
		else if (!(flag & 16)) {
			x += binary.readInt16BE(cursor);
			cursor += 2;
		}
		xs.push(x);
	}
	for (const flag of flags) {
		if (flag & 4) y += (flag & 32 ? 1 : -1) * binary[cursor++];
		else if (!(flag & 32)) {
			y += binary.readInt16BE(cursor);
			cursor += 2;
		}
		ys.push(y);
	}
	return flags.map((flag, index) => ({ x: xs[index], y: ys[index], on: !!(flag & 1) }));
}
function polygon(pts) {
	const chain = [];
	for (let i = 0; i < pts.length; i++) {
		const first = pts[i];
		const next = pts[(i + 1) % pts.length];
		if (!first.on && !next.on) {
			chain.push(first, { x: (first.x + next.x) / 2, y: (first.y + next.y) / 2, on: true });
		} else chain.push(first);
	}
	const result = [];
	for (let i = 0; i < chain.length; i++) {
		const first = chain[i];
		const next = chain[(i + 1) % chain.length];
		if (!first.on) continue;
		if (next.on) {
			result.push(first);
			continue;
		}
		const last = chain[(i + 2) % chain.length];
		for (let step = 0; step < 10; step++) {
			const fraction = step / 10;
			const remainder = 1 - fraction;
			result.push({
				x: remainder * remainder * first.x + 2 * remainder * fraction * next.x + fraction * fraction * last.x,
				y: remainder * remainder * first.y + 2 * remainder * fraction * next.y + fraction * fraction * last.y
			});
		}
	}
	return result;
}
function clip(vertices, boundary, greater) {
	const inside = point => greater ? point.x >= boundary : point.x <= boundary;
	const result = [];
	for (let i = 0; i < vertices.length; i++) {
		const first = vertices[i];
		const next = vertices[(i + 1) % vertices.length];
		if (inside(first)) result.push(first);
		if (inside(first) !== inside(next)) {
			const t = (boundary - first.x) / (next.x - first.x);
			result.push({ x: boundary, y: first.y + t * (next.y - first.y) });
		}
	}
	return result;
}
function makeGlyph(vertices) {
	if (vertices.length < 3) return Buffer.alloc(0);
	const coords = vertices.map(point => [Math.round(point.x), Math.round(point.y)]);
	const xs = coords.map(point => point[0]);
	const ys = coords.map(point => point[1]);
	const bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
	const output = Buffer.alloc(14 + coords.length * 5);
	output.writeInt16BE(1, 0);
	bounds.forEach((value, index) => output.writeInt16BE(value, 2 + index * 2));
	output.writeUInt16BE(coords.length - 1, 10);
	output.writeUInt16BE(0, 12);
	let cursor = 14;
	for (let i = 0; i < coords.length; i++) output[cursor++] = 1;
	let x = 0;
	let y = 0;
	for (const [next] of coords) {
		output.writeInt16BE(next - x, cursor);
		cursor += 2;
		x = next;
	}
	for (const [, next] of coords) {
		output.writeInt16BE(next - y, cursor);
		cursor += 2;
		y = next;
	}
	return output;
}
function fragmentGlyphs(binary) {
	const vertices = polygon(points(binary));
	const bounds = [36, 220, 420, 596];
	return Array.from({ length: 3 }, (_, index) => {
		const clipped = clip(clip(vertices, bounds[index], true), bounds[index + 1], false);
		return makeGlyph(clipped);
	});
}
module.exports = { fragmentGlyphs };
