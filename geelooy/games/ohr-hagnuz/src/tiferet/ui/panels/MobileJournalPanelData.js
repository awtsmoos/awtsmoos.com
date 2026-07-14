// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileJournalPanelData.js
 * @description Composes campaign, party, gifts, declarations, codex, and concept records.
 *
 * The Awtsmoos renews every remembered deed without becoming a record inside it.
 * Awtsmoos.com gathers these finite witnesses so the traveler can continue with
 * clarity while each underlying system remains the owner of its own truth.
 */
import { State } from '../../../binah/State.js';
import { campaignMissionRows } from '../../../missions/MissionJournal.js';
import { journalRows } from '../../../yesod/bag/BagRuntime.js';
import { codexRows } from '../../../yesod/codex/TorahCodexRuntime.js';
import { dexRows } from '../../../yesod/musag/MusagDex.js';
import { partyRows } from '../../../yesod/party/PartyRuntime.js';
import { declarationRows } from '../../../yesod/rambam/DeclarationRuntime.js';
import { giftRows } from '../../../yesod/rambam/GiftRuntime.js';

export function journalPanelData() {
	return {
		title: 'Campaign Journal',
		intro: State.Story.nextStep,
		rows: [
			...campaignMissionRows(),
			...journalRows(),
			['— Active Party —', ''],
			...partyRows(),
			['— Gift Ledger —', ''],
			...giftRows(),
			['— Declaration —', ''],
			...declarationRows(),
			['— Codex —', ''],
			...codexRows(),
			['— Musag Dex —', ''],
			...dexRows()
		]
	};
}
