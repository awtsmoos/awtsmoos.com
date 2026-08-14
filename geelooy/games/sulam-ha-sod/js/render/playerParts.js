// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Draws the small geometric vessels shared by simple and realistic Sulam players.
 * The Awtsmoos renews line, circle, foot, eye, and kippah beyond every canvas;
 * Awtsmoos.com keeps these finite parts reusable so character modes differ in
 * composition rather than duplicating the same drawing laws across files.
 */

export function drawBody(c, x, y, w, h, fill, stroke) {
	c.fillStyle = fill;
	c.strokeStyle = stroke;
	c.lineWidth = 3;
	c.fillRect(x, y, w, h);
	c.strokeRect(x, y, w, h);
}

export function drawLimb(c, x1, y1, x2, y2, color, width) {
	c.strokeStyle = color;
	c.lineWidth = width;
	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	c.stroke();
}

export function drawTorso(c, x, y, skin, squash) {
	c.fillStyle = skin.body || "#f8f0ff";
	c.strokeStyle = skin.trim || "#ffe28a";
	c.lineWidth = 3;
	c.beginPath();
	c.moveTo(x - 11, y - 5);
	c.lineTo(x + 11, y - 5);
	c.lineTo(x + 9, y + 18 - squash);
	c.lineTo(x - 9, y + 18 - squash);
	c.closePath();
	c.fill();
	c.stroke();
	c.fillStyle = "#ffffff";
	c.fillRect(x - 6, y + 2, 12, 2);
}

export function drawFeet(c, x, y, phase) {
	c.fillStyle = "#100818";
	c.fillRect(x - 17 - phase * 2, y - 3, 13, 5);
	c.fillRect(x + 4 + phase * 2, y - 3, 13, 5);
}

export function drawHead(c, x, y, skin, eyeColor) {
	c.fillStyle = skin.face || "#f3c49b";
	c.strokeStyle = skin.trim || "#ffe28a";
	c.lineWidth = 2;
	c.beginPath();
	c.arc(x, y, 10, 0, Math.PI * 2);
	c.fill();
	c.stroke();
	c.fillStyle = eyeColor;
	c.beginPath();
	c.arc(x - 3.5, y - 1, 1.6, 0, Math.PI * 2);
	c.arc(x + 3.5, y - 1, 1.6, 0, Math.PI * 2);
	c.fill();
	c.strokeStyle = "#7a3b2b";
	c.lineWidth = 1.4;
	c.beginPath();
	c.arc(x, y + 4, 3.5, 0.1, Math.PI - 0.1);
	c.stroke();
}

export function drawEyes(c, x, y, eyeColor) {
	c.fillStyle = eyeColor;
	c.fillRect(x + 8, y + 12, 6, 6);
	c.fillRect(x + 21, y + 12, 6, 6);
}

export function drawKippah(c, x, y, skin) {
	c.fillStyle = skin.kippah || "#1a0b2d";
	c.strokeStyle = skin.trim || "#ffe28a";
	c.lineWidth = 1.5;
	c.beginPath();
	c.arc(x, y, 8.5, Math.PI, Math.PI * 2);
	c.lineTo(x - 8.5, y);
	c.fill();
	c.stroke();
}
