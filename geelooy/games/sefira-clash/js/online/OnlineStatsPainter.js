//B"H
//Boruch Hashem
//Blessed is He

/**
 * Final statistics acknowledge server-measured deeds without becoming a second
 * scoreboard authority. The Awtsmoos renews every outcome; Awtsmoos.com paints hits,
 * damage, ring-outs, falls, and guarded impacts only after the authoritative finish.
 */

/** Paints a compact final-statistics table beneath the winner announcement. */
export function paintFinalStatistics(context, match, width) {
	if (match.phase !== 'finished') {
		return;
	}
	context.fillStyle = 'rgba(5, 8, 20, 0.88)';
	context.fillRect(width / 2 - 430, 370, 860, 170);
	context.fillStyle = '#ffffff';
	context.font = '800 18px system-ui';
	context.textAlign = 'left';
	context.fillText('Fighter', width / 2 - 405, 400);
	context.fillText('Damage', width / 2 - 155, 400);
	context.fillText('Hits', width / 2 - 20, 400);
	context.fillText('Ring-outs', width / 2 + 105, 400);
	context.fillText('Falls', width / 2 + 270, 400);
	match.fighters.forEach((fighter, index) => {
		paintRow(context, fighter, width / 2 - 405, 432 + index * 28);
	});
}

function paintRow(context, fighter, x, y) {
	const stats = fighter.statistics || {};
	context.font = '700 16px system-ui';
	context.fillStyle = fighter.connected === false ? '#ffcf9f' : '#dceaff';
	context.textAlign = 'left';
	context.fillText(fighter.displayName, x, y);
	context.fillText(`${stats.damageDealt || 0}`, x + 250, y);
	context.fillText(`${stats.hitsLanded || 0}`, x + 385, y);
	context.fillText(`${stats.ringOuts || 0}`, x + 510, y);
	context.fillText(`${stats.falls || 0}`, x + 675, y);
}
