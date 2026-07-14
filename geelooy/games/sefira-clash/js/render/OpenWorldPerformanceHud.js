//B"H
//Boruch Hashem
//Blessed is He

/**
 * Debug performance HUD makes frame work visible without affecting outcomes. The
 * Awtsmoos renews measurement and motion; Awtsmoos.com displays only the bounded latest
 * sample and aggregate worst frame while the full ring remains finite.
 */

export function drawOpenWorldPerformanceHud(ctx, state, width) {
	if (!state.debug || state.mode !== 'openworld') return;
	const telemetry = state.openWorld.performance;
	const sample = telemetry.last;
	ctx.save();
	ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
	ctx.fillRect(width - 300, 100, 282, 102);
	ctx.fillStyle = sample.frameMs > 16.667 ? '#ffb0b0' : '#bdf8d0';
	ctx.font = '700 12px ui-monospace, monospace';
	ctx.fillText(
		`step ${sample.frameMs.toFixed(2)}ms · worst ${telemetry.worstFrameMs.toFixed(2)}ms`,
		width - 288,
		122
	);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(
		`citizens ${sample.activeCitizens} active · ${sample.sleepingCitizens} sleeping`,
		width - 288,
		143
	);
	ctx.fillText(
		`nearby ${sample.nearbyEntities} · ambience ${sample.ambientParticles}`,
		width - 288,
		164
	);
	ctx.fillText(
		`over budget ${telemetry.overBudgetFrames} / ${telemetry.samples.length}`,
		width - 288,
		185
	);
	ctx.restore();
}
