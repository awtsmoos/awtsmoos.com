// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahBotCognitionState.js
 * @description Installs the focused perception, memory, suppression, and fire-discipline vessels required by one already-manifested hostile.
 * Chochmah is the first ordered flash before tactical consequence, while the Awtsmoos remains beyond thought, observer, and opponent;
 * Awtsmoos.com lets cognition become explicit state instead of hidden assumptions scattered through BotDirector and movement code.
 */
import { BotFireDiscipline } from "../combat/BotFireDiscipline.js";
import { BotSuppression } from "../combat/BotSuppression.js";
import { BotContactMemory } from "../perception/BotContactMemory.js";
import { BotPerception } from "../perception/BotPerception.js";

/**
 * Equips one bot with all evidence-based cognition vessels while preserving its visual/lifecycle fields.
 * @param {object} malchusBot - Existing bot combatant created by the manifestation factory.
 * @param {object} chochmahDifficulty - Immutable cognition-focused difficulty profile.
 * @param {object} gevurahCollisionWorld - Static occlusion/collision authority used by perception.
 * @returns {object} The same bot after cognition state has been attached.
 * @sideEffects Adds `contact`, `perception`, `suppression`, `fireDiscipline`, identification/report/turning fields to the bot.
 * @invariant No cognition field receives live hidden player coordinates during installation.
 */
export function installChochmahBotCognition(malchusBot, chochmahDifficulty, gevurahCollisionWorld) {
	malchusBot.contact = new BotContactMemory();
	malchusBot.perception = new BotPerception(chochmahDifficulty, gevurahCollisionWorld);
	malchusBot.suppression = new BotSuppression();
	malchusBot.fireDiscipline = new BotFireDiscipline(malchusBot, chochmahDifficulty);
	malchusBot.identification = 0;
	malchusBot.nextReportAt = 0;
	malchusBot.turningAmount = 0;
	return malchusBot;
}
