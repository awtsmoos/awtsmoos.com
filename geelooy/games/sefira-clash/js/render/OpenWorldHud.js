//B"H
//Boruch Hashem
//Blessed is He

/**
 * The lived-world HUD names room, weather, stamina, focus, technique, prompt, and active
 * shlichus without stocks or winner framing. The Awtsmoos renews every visible purpose;
 * Awtsmoos.com carries full meaning in text even when color and motion are unavailable.
 */

export function drawOpenWorldHud(ctx, state, width, height) {
	if (state.mode !== 'openworld' || !state.openWorld) return;
	const world = state.openWorld;
	const combat = world.combat;
	ctx.save();
	drawIdentity(ctx, world, state.expedition?.weather, width);
	drawMeter(ctx, 24, 82, 230, combat.stamina / 100, 'Stamina', '#8ef0b6');
	drawMeter(ctx, 24, 111, 230, combat.focus / 100, 'Focus', '#84d9ff');
	drawTechnique(ctx, combat, 24, 154);
	drawMission(ctx, world.missionObjective, width, height);
	if (world.prompt) drawPrompt(ctx, world.prompt, width, height);
	ctx.restore();
}

function drawIdentity(ctx, world, weather, width) {
	ctx.fillStyle = 'rgba(3, 6, 18, 0.84)';
	ctx.fillRect(18, 18, Math.min(590, width - 36), 54);
	ctx.fillStyle = '#ffffff';
	ctx.font = '700 17px system-ui, sans-serif';
	ctx.fillText(`${world.locationName} · ${sceneLabel(world)}`, 32, 43);
	ctx.fillStyle = '#fff2ad';
	ctx.font = '12px system-ui, sans-serif';
	ctx.fillText(
		`${weather?.time?.label || 'World time'} · ${weather?.label || 'clear road'}`,
		32,
		62
	);
}

function drawMeter(ctx, x, y, width, ratio, label, color) {
	ctx.fillStyle = 'rgba(3, 6, 18, 0.78)';
	ctx.fillRect(x, y, width, 21);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
	ctx.fillRect(x + 66, y + 7, width - 78, 7);
	ctx.fillStyle = color;
	ctx.fillRect(x + 66, y + 7, Math.max(0, Math.min(1, ratio)) * (width - 78), 7);
	ctx.fillStyle = '#ffffff';
	ctx.font = '600 11px system-ui, sans-serif';
	ctx.fillText(label, x + 8, y + 15);
}

function drawTechnique(ctx, combat, x, y) {
	ctx.fillStyle = 'rgba(3, 6, 18, 0.78)';
	ctx.fillRect(x, y, 320, 44);
	ctx.fillStyle = '#fff2ad';
	ctx.font = '700 13px system-ui, sans-serif';
	ctx.fillText(combat.techniqueName || 'Measured hands and feet', x + 10, y + 18);
	ctx.fillStyle = '#ffffff';
	ctx.font = '11px system-ui, sans-serif';
	ctx.fillText(`Chain ${combat.chainStep + 1} · window ${combat.chainWindow}`, x + 10, y + 35);
}

function drawMission(ctx, mission, width, height) {
	if (!mission) return;
	const panelWidth = Math.min(520, width - 36);
	ctx.fillStyle = 'rgba(3, 6, 18, 0.82)';
	ctx.fillRect(width - panelWidth - 18, 18, panelWidth, 70);
	ctx.fillStyle = '#bdf8d0';
	ctx.font = '700 14px system-ui, sans-serif';
	ctx.fillText(mission.name, width - panelWidth, 43);
	ctx.fillStyle = '#ffffff';
	ctx.font = '12px system-ui, sans-serif';
	ctx.fillText(mission.text, width - panelWidth, 65);
}

function drawPrompt(ctx, prompt, width, height) {
	ctx.font = '800 18px system-ui, sans-serif';
	const measured = ctx.measureText(prompt).width + 44;
	ctx.fillStyle = 'rgba(3, 6, 18, 0.9)';
	ctx.fillRect((width - measured) / 2, height - 82, measured, 44);
	ctx.strokeStyle = '#fff2ad';
	ctx.strokeRect((width - measured) / 2, height - 82, measured, 44);
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'center';
	ctx.fillText(prompt, width / 2, height - 53);
	ctx.textAlign = 'left';
}

function sceneLabel(world) {
	return world.interiorId ? world.interiorId.replaceAll('-', ' ') : 'city streets';
}
