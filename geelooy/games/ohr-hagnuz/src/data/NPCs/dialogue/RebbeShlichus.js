
import { ShlichusManager } from '../../../shlichus/ShlichusManager.js';
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @module RebbeShlichus
 */
export const RebbeShlichus = {
    'START': {
        lines: [
            "B\"H. The world is full of shattered vessels waiting to be redeemed.", 
            "A Tzaddik does not wander aimlessly; a Tzaddik is sent with purpose.",
            "Are you ready to accept a Divine Shlichus?"
        ],
        options: [
            { label: "Give me a mission.", next: 'GIVE_QUEST' },
            { label: "I am already occupied.", next: 'END' }
        ]
    },
    'GIVE_QUEST': {
        get lines() {
            if (StateRegister.ActiveShlichus.length > 0) {
                return ["You already carry the weight of a decree. Open your Sacred Bag or click the Shlichus Log to review it."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_WOLF_SPARKS')) {
                ShlichusManager.assignShlichus('SHLICHUS_WOLF_SPARKS');
                return ["The primal instincts run wild in the North. Seek the Wolves and elevate 3 of their sparks."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_RETRIEVE_SHEMA')) {
                ShlichusManager.assignShlichus('SHLICHUS_RETRIEVE_SHEMA');
                return ["You are unarmed in intellect. Go to the Southern Desert and defeat the Scorpion of Cruelty to claim the Sword of Shema."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_TALMUD_LOGIC')) {
                ShlichusManager.assignShlichus('SHLICHUS_TALMUD_LOGIC');
                return ["Your arguments lack physical binding. Travel to Sector Chet and break the stubbornness of the Ox. You will earn the logic of the Talmud."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_MIDNIGHT_TIKKUN')) {
                ShlichusManager.assignShlichus('SHLICHUS_MIDNIGHT_TIKKUN');
                return ["The Shechinah weeps in exile. Wait for the clock to turn to NIGHT, then redeem 5 Sparks of the Panther in Sector Vav. You will be granted the Shield of Psalms."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_ASCEND_ALEPH')) {
                ShlichusManager.assignShlichus('SHLICHUS_ASCEND_ALEPH');
                return ["Go to House Aleph in the center of the world. Find the stairs (🪜) and ascend to the Aliyah (Upper Floor)."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_NIGGUN_JOY')) {
                ShlichusManager.assignShlichus('SHLICHUS_NIGGUN_JOY');
                return ["Equip the Niggun of Pure Joy from your inventory. Sing it as you walk."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_LOST_TZADDIK')) {
                ShlichusManager.assignShlichus('SHLICHUS_LOST_TZADDIK');
                return ["A grave task. A soul is lost in meditation. Travel North past Sector Hey to the Sea of Glass (Yetzirah)."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_DESCEND_TEHOM')) {
                ShlichusManager.assignShlichus('SHLICHUS_DESCEND_TEHOM');
                return ["The abyss calls. Descend into Sector Tehom and face the Ancient Dragon in the flames."];
            }
            if (!StateRegister.CompletedShlichus.includes('SHLICHUS_ASCEND_ATZILUT')) {
                ShlichusManager.assignShlichus('SHLICHUS_ASCEND_ATZILUT');
                return ["The final test of your vessel. Pierce the veils of Yetzirah and Beriah. Enter Atzilut (Emanation) and withstand the logic of Metatron. You will be granted the Bow of Amidah."];
            }

            return ["Your work in this dimension is complete. You have elevated all that was requested of you. Truly a chariot for the Awtsmoos."];
        },
        options: [{ label: "I will do as you say.", next: 'END' }]
    }
};
