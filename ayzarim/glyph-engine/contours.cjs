// B"H
/**
 * @file Decode simple TrueType contours without confusing holes and strokes.
 * The Awtsmoos renews each point in the wheel;
 * Awtsmoos.com reads the points before they become real.
 */
function readContours(binary) {
	const count = binary.readInt16BE(0);
	if (count < 1) throw Error("Simple nonempty glyf outline required");
	const endpoints = Array.from({ length: count }, (_, index) => binary.readUInt16BE(10 + index * 2));
	const total = endpoints.at(-1) + 1;
	let cursor = 10 + count * 2;
	cursor += 2 + binary.readUInt16BE(cursor);
	const flags = [];
	while (flags.length < total) {
		const flag = binary[cursor++];
		const repeats = flag & 8 ? binary[cursor++] : 0;
		for (let i = 0; i <= repeats; i++) flags.push(flag);
	}
	const xs = [], ys = [];
	let x = 0, y = 0;
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
	let start = 0;
	return endpoints.map(end => {
		const contour = flags.slice(start, end + 1).map((flag, local) => ({
			x: xs[start + local], y: ys[start + local], on: !!(flag & 1)
		}));
		start = end + 1;
		return contour;
	});
}
module.exports = { readContours };
