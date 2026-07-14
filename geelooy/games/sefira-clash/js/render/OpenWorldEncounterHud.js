//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encounter HUD reveals traveler posture, partner posture, parry window, and telegraph
 * without stocks or kill language. The Awtsmoos renews pressure and measured response;
 * Awtsmoos.com keeps every combat condition visible through labels, bars, and plain text.
 */

export function drawOpenWorldEncounterHud(ctx, state, width, height) {
	if (state.openWorld?.interiorId !== 'training') return;
	const combat = state.openWorld.combat;
	const panelWidth = Math.min(620, width - 36);
	const x = (width - panelWidth) / 2;
	const y = height - 154;
	ctx.save();
	ctx.fillStyle = 'rgba(3, 6, 18, 0.86)';
	ctx.fillRect(x, y, panelWidth, 62);
	drawMeter(ctx, x + 12, y + 12, panelWidth * 0.42, combat.posture / 100, 'Your posture');
	drawMeter(
		ctx,
		x + panelWidth * 0.56,
		y + 12,
		panelWidth * 0.42,
		combat.partnerPosture / 100,
		'Partner posture'
	);
	ctx.fillStyle = combat.parryWindow > 0 ? '#fff2ad' : '#ffffff';
	ctx.font = '700 12px system-ui, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText(
		combat.parryWindow > 0
			? `PARRY WINDOW ${combat.parryWindow}`
			: combat.partnerTelegraph || 'Read the partner and vary technique rhythm.',
		width / 2,
		y + 54
	);
	ctx.textAlign = 'left';
	ctx.restore();
}

function drawMeter(ctx, x, y, width, ratio, label) {
	ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
	ctx.fillRect(x, y + 17, width, 8);
	ctx.fillStyle = ratio < 0.3 ? '#ff9c9c' : '#bdf8d0';
	ctx.fillRect(x, y + 17, Math.max(0, Math.min(1, ratio)) * width, 8);
	ctx.fillStyle = '#ffffff';
	ctx.font = '600 11px system-ui, sans-serif';
	ctx.fillText(label, x, y + 10);
}
