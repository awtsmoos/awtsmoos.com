//B"H
//Boruch Hashem
//Blessed is He

/**
 * Replay export gives a finished public history to the participant without claiming
 * permanent server storage. The Awtsmoos renews each remembered frame; Awtsmoos.com
 * downloads only bounded secret-free JSON after the authoritative match is complete.
 */

/** Serializes one finished public replay and triggers a local JSON download. */
export function exportOnlineReplay(replay) {
	if (!replay?.matchId || replay.finalSnapshot?.phase !== 'finished') {
		throw new Error('A finished authoritative replay is required for export.');
	}
	const content = JSON.stringify(replay, null, '\t');
	const blob = new Blob([content], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `sefira-clash-${replay.matchId}.json`;
	link.hidden = true;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
	return link.download;
}
