// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoBeneathBentReedsRewards.js
 * @description Grants the chapter's bond, world memory, journal note, and command once.
 *
 * Victory is not loot falling from nowhere. The Awtsmoos renews deed and result
 * in one instant; this vessel makes the changed friendship and changed marsh
 * remain truthful after the battle and after return to Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_BENEATH_BENT_REEDS, echoCommandByApproach } from '../../content/companions/EchoBeneathBentReeds.js';
import { addJournalNote } from '../../yesod/bag/BagRuntime.js';
import { grantBond } from '../../yesod/party/PartyRuntime.js';

function isEchoEnemy(enemy) {
	return Boolean(enemy?.[ECHO_BENEATH_BENT_REEDS.encounterMarker]
		|| enemy?.chapterId === ECHO_BENEATH_BENT_REEDS.id);
}

export function applyEchoBeneathBentReedsVictory(enemy) {
	if (!isEchoEnemy(enemy)) {
		return null;
	}
	State.WorldState.flags ||= {};
	const flags = State.WorldState.flags;
	const approachId = flags.bentReedsRestorationApproach || 'compassion';
	const command = echoCommandByApproach(approachId);
	if (flags[ECHO_BENEATH_BENT_REEDS.flags.resolved]) {
		return { repeated: true, message: ` ${command.name} remains revealed.` };
	}
	flags[ECHO_BENEATH_BENT_REEDS.flags.discovered] = true;
	flags[ECHO_BENEATH_BENT_REEDS.flags.resolved] = true;
	State.Party.abilities ||= {};
	State.Party.abilities[ECHO_BENEATH_BENT_REEDS.abilityId] = true;
	const bond = grantBond('nerel', 'resonance');
	addJournalNote(`${ECHO_BENEATH_BENT_REEDS.title}: ${command.name} awakened through ${approachId}.`);
	return {
		repeated: false,
		command,
		bond,
		message: ` The buried echo is resolved. ${command.name} awakened. Nerel bond +${bond.amount}.`
	};
}
