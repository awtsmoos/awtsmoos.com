// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobilePassagePanelData.js
 * @description Projects sourced passages into a respectful reading surface.
 *
 * The Awtsmoos is beyond every verse, translation, garment, and interface. On
 * Awtsmoos.com this vessel keeps source, context, fictional reading, and game
 * resonance distinct so no created mechanic is mistaken for sacred text.
 */
import { passageEntries } from '../../../yesod/codex/PassageCollectionRuntime.js';

function passageRows() {
	return passageEntries().flatMap(entry => [
		[entry.title, entry.source.citation],
		['Hebrew', entry.hebrew],
		[
			'Translation',
			`${entry.translation.text} — ${entry.translation.provenance}`
		],
		['Context', entry.context],
		['In-game reading', entry.fictionalReading],
		['Garment manifestation', entry.mechanicalResonance.garmentId],
		['Study staff', entry.mechanicalResonance.itemDefinitionId],
		['Reading mastery', `${entry.reads} reads • mastery ${entry.mastery}`]
	]);
}

export function passagePanelData() {
	const rows = passageRows();
	return {
		title: 'Torah Passage Codex',
		intro: 'Source text, translation, context, fictional reading, and game effects remain distinct.',
		rows: rows.length
			? rows
			: [[
				'No sourced passages yet',
				'Restore concealed light through living Shlichus.'
			]]
	};
}
