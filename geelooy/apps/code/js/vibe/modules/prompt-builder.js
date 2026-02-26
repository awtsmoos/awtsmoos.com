
// B"H
/**
 * @file prompt-builder.js
 * @brief The Chariot of Instruction for the Vibe manifestation.
 */

import { ModelManager } from '../model-manager.js';
import promptData from './promptData.js';

export const PromptBuilder = {
    /**
     * B"H - Returns the default instructions for the AI model.
     */
    getDefaultSystemBase() {
        const S = "₪₪₪_בס\"ד_תחי" + "לת_הק" + "וד_₪₪₪";
        const E = "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪";

        const tO = "<" + "chan" + "ge>";
        const tC = "</" + "chan" + "ge>";
        const fO = "<" + "fi" + "le>";
        const fC = "</" + "fi" + "le>";
        const oO = "<" + "operat" + "ion>";
        const oC = "</" + "operat" + "ion>";
        const dO = "<" + "descrip" + "tion>";
        const dC = "</" + "descrip" + "tion>";
        const cO = "<" + "cont" + "ent>";
        const cC = "</" + "cont" + "ent>";

        return `B"H\n` + promptData + `\n\n` +
`CRITICAL OUTPUT RITUAL:
1. You MUST output changes using the EXACT XML format provided below.
2. Put the COMPLETE raw code inside the ` + cO + ` tag.
3. Use THESE HEBREW MARKERS to wrap the code within the ` + cO + ` tag:
   START: ${S}
   END: ${E}

SACRED XML FORMAT:
` + tO + `
  ` + fO + `path/to/vessel.js` + fC + `
  ` + oO + `write` + oC + `
  ` + dO + `Kabbalistic description of the rectification.` + dC + `
  ` + cO + `${S}
// Code essence here
${E}` + cO + `
` + tC;
    },

    /**
     * @function getSystem
     * @description Constructs the final prompt string.
     */
    getSystem(markdownContext) {
        const baseInstructions = ModelManager.getCustomPrompt() || this.getDefaultSystemBase();
        return `${baseInstructions}\n\nCURRENT REALITY (Codebase Context):\n${markdownContext}`;
    }
};
