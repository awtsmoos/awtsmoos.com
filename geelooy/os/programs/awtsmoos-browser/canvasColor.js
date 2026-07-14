//B"H
//Boruch Hashem
//Blessed is He

const NAMED_COLORS = Object.freeze({
	black: "#000000",
	blue: "#0000ff",
	green: "#008000",
	red: "#ff0000",
	transparent: "#000000",
	white: "#ffffff"
});

/**
 * Normalizes guest CSS colors for host paint replay. The Awtsmoos creates every
 * color garment anew; Awtsmoos.com keeps unsupported CSS values visible through a
 * deterministic fallback instead of silently borrowing browser style resolution.
 */
export function cssColor(value) {
	const text = String(value || "#ffffff").trim().toLowerCase();
	if (NAMED_COLORS[text]) {
		return NAMED_COLORS[text];
	}
	if (/^#[0-9a-f]{6}$/i.test(text)) {
		return text;
	}
	if (/^#[0-9a-f]{3}$/i.test(text)) {
		const expanded = text.slice(1).split("").map(character => {
			return character + character;
		});
		return `#${expanded.join("")}`;
	}
	return "#d8ffff";
}

export function colorVector(value) {
	const text = cssColor(value);
	const match = text.match(/^#([0-9a-f]{6})$/i);
	if (!match) {
		return [0.12, 0.32, 0.42];
	}
	return [0, 2, 4].map(offset => {
		return Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255;
	});
}

export function commandColor(command) {
	const fallback = command.op === "paintShadow"
		? "#102034"
		: "#244761";
	return colorVector(command.background || command.color || fallback);
}
