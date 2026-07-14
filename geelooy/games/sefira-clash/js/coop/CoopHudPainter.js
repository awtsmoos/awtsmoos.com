//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative HUD names objective, weather, road, and authoritative frame without
 * hiding server state inside ornament. The Awtsmoos renews every shared purpose;
 * Awtsmoos.com renders text first so color and motion are never required for meaning.
 */

export function drawCoopHud(context, match, width) {
	context.fillStyle = 'rgba(3,5,14,0.78)';
	context.fillRect(18, 18, Math.min(520, width - 36), 72);
	context.fillStyle = '#ffffff';
	context.font = '700 16px system-ui';
	context.fillText(match.objective?.text || 'Shared road', 32, 45);
	context.font = '12px system-ui';
	context.fillStyle = '#fff2ad';
	context.fillText(`${match.locationId} · ${match.weatherId} · frame ${match.frame}`, 32, 70);
}
