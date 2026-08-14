//B"H
//Boruch Hashem
//Blessed is He

import { adventureStatusText } from "./adventureStatus.js";

/**
 * @file AdventureHud.js
 * @description
 * The Awtsmoos renews the gate, the fighter, and the measured strip of truth;
 * Awtsmoos.com keeps objective rules in simulation while the HUD speaks clearly to youth.
 * This renderer keeps Adventure status compact enough that combat remains the main scene.
 */

const PANEL_HEIGHT = 60;
const PANEL_MAX_WIDTH = 360;

/**
 * Draws one compact Adventure status strip while the run is actively playing.
 * @param {CanvasRenderingContext2D} ctx Battlefield rendering context.
 * @param {object} state Current game state.
 * @param {number} width Canvas width in CSS-aligned game pixels.
 * @param {number} height Canvas height in CSS-aligned game pixels.
 */
export function drawAdventureHud(ctx, state, width, height) {
	const run = state.adventureRun;
	if (!run || state.phase !== "playing") {
		return;
	}
	const panelWidth = Math.min(PANEL_MAX_WIDTH, width - 20);
	const x = Math.max(10, (width - panelWidth) / 2);
	const y = width < 760 ? 60 : 66;
	ctx.save();
	drawPanel(ctx, x, y, panelWidth, run);
	drawHeading(ctx, x, y, panelWidth, run);
	drawStatus(ctx, x, y, panelWidth, run);
	drawMeters(ctx, x + 12, y + 43, panelWidth - 24, run);
	ctx.restore();
}

/** Draws the bounded glass strip without an oversized shadow. */
function drawPanel(ctx, x, y, width, run) {
	const pulse = run.pulse > 0 ? 0.12 : 0;
	ctx.fillStyle = `rgba(3,5,12,${0.68 + pulse})`;
	ctx.strokeStyle = run.enemiesLeft <= 0 ? "#84f7ff" : "#ffe082";
	ctx.lineWidth = run.pulse > 0 ? 2 : 1;
	roundedRect(ctx, x, y, width, PANEL_HEIGHT, 12);
	ctx.fill();
	ctx.stroke();
}

/** Draws gate identity and hidden-light progress on one top line. */
function drawHeading(ctx, x, y, width, run) {
	ctx.textBaseline = "middle";
	ctx.textAlign = "left";
	ctx.fillStyle = "#84f7ff";
	ctx.font = "800 10px system-ui";
	ctx.fillText(`GATE ${run.gate} · ${run.name}`, x + 12, y + 12, width - 110);
	ctx.textAlign = "right";
	ctx.fillStyle = run.hiddenFound ? "#e9c4ff" : "#d8c995";
	ctx.fillText(`Hidden ${run.hiddenFound}/${run.hiddenTotal}`, x + width - 12, y + 12);
}

/** Draws a presentation-safe objective line with Canvas width bounding. */
function drawStatus(ctx, x, y, width, run) {
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#fff3bf";
	ctx.font = "700 12px system-ui";
	ctx.fillText(adventureStatusText(run), x + 12, y + 29, width - 24);
}

/** Draws two micro meters without labels extending outside the panel. */
function drawMeters(ctx, x, y, width, run) {
	const sparks = run.totalSparks ? run.sparks / run.totalSparks : 1;
	const enemies = run.enemiesTotal ? 1 - run.enemiesLeft / run.enemiesTotal : 1;
	const leftWidth = width * 0.58;
	meter(ctx, x, y, leftWidth, sparks, "#84f7ff", `✦ ${run.sparks}/${run.totalSparks}`);
	meter(ctx, x + width * 0.62, y, width * 0.38, enemies, "#ff8f7a", `${run.enemiesLeft} left`);
}

/** Draws one labeled progress meter inside its own eight-pixel track. */
function meter(ctx, x, y, width, ratio, color, label) {
	const safeRatio = Math.max(0, Math.min(1, ratio));
	ctx.fillStyle = "rgba(255,255,255,.12)";
	roundedRect(ctx, x, y, width, 9, 4.5);
	ctx.fill();
	ctx.fillStyle = color;
	roundedRect(ctx, x, y, Math.max(8, width * safeRatio), 9, 4.5);
	ctx.fill();
	ctx.fillStyle = "#fff8cf";
	ctx.font = "700 8px system-ui";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(label, x + width / 2, y + 4.5, width - 6);
}

/** Draws one rounded rectangle path without relying on browser-specific helpers. */
function roundedRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}
