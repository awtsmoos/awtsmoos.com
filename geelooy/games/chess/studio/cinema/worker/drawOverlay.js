//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets words hover above the board without altering the chess beneath;
 * Awtsmoos.com paints titles, SAN, badges, and results in a restrained cinematic sheath.
 */
export function drawMovieOverlay(ctx, canvas, overlay = {}, style = {}) {
	if (!overlay || style.overlays === false) return;
	const width = canvas.width;
	const height = canvas.height;
	const scale = Math.max(1, width / 1280);
	ctx.save();
	drawShade(ctx, width, height);
	if (overlay.kind === "intro") drawIntro(ctx, overlay, width, height, scale);
	else if (overlay.kind === "outro") drawOutro(ctx, overlay, width, height, scale);
	else drawMove(ctx, overlay, width, height, scale);
	ctx.restore();
}
function drawShade(ctx, width, height) {
	const top = ctx.createLinearGradient(0, 0, 0, height * 0.28);
	top.addColorStop(0, "rgba(0,0,0,.68)");
	top.addColorStop(1, "rgba(0,0,0,0)");
	ctx.fillStyle = top;
	ctx.fillRect(0, 0, width, height * 0.3);
	const bottom = ctx.createLinearGradient(0, height, 0, height * 0.68);
	bottom.addColorStop(0, "rgba(0,0,0,.72)");
	bottom.addColorStop(1, "rgba(0,0,0,0)");
	ctx.fillStyle = bottom;
	ctx.fillRect(0, height * 0.65, width, height * 0.35);
}
function drawIntro(ctx, overlay, width, height, scale) {
	ctx.textAlign = "center";
	ctx.fillStyle = "white";
	ctx.font = `700 ${52 * scale}px system-ui`;
	ctx.fillText(overlay.title || "Chess Cinema", width / 2, height * 0.16);
	ctx.font = `400 ${22 * scale}px system-ui`;
	ctx.fillStyle = "rgba(255,255,255,.82)";
	ctx.fillText(overlay.subtitle || "", width / 2, height * 0.205);
}
function drawMove(ctx, overlay, width, height, scale) {
	ctx.textAlign = "left";
	ctx.fillStyle = "white";
	ctx.font = `800 ${46 * scale}px ui-monospace, monospace`;
	ctx.fillText(overlay.san || "", 42 * scale, height - 54 * scale);
	ctx.font = `500 ${18 * scale}px system-ui`;
	ctx.fillStyle = "rgba(255,255,255,.8)";
	ctx.fillText(overlay.player || "", 44 * scale, height - 27 * scale);
	if (overlay.badge) drawBadge(ctx, overlay.badge, width, height, scale);
}
function drawOutro(ctx, overlay, width, height, scale) {
	ctx.textAlign = "center";
	ctx.fillStyle = "white";
	ctx.font = `800 ${58 * scale}px system-ui`;
	ctx.fillText(overlay.result || "Game complete", width / 2, height * 0.17);
	ctx.font = `400 ${20 * scale}px system-ui`;
	ctx.fillText(overlay.subtitle || "", width / 2, height * 0.215);
}
function drawBadge(ctx, badge, width, height, scale) {
	ctx.textAlign = "right";
	ctx.font = `700 ${20 * scale}px system-ui`;
	ctx.fillStyle = badge === "MATE" ? "#ff4d6d" : "#ffd166";
	ctx.fillText(badge, width - 42 * scale, height - 46 * scale);
}
