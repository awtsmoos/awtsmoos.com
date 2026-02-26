
// B"H
/**
 * @file prompt-builder.js
 * @brief The Chariot of Instruction for the Vibe manifestation.
 */

import { ModelManager } from '../model-manager.js';
import promptData from './promptData.js';

/**
 * @constant PromptBuilder
 * @description Manifests the system instructions for the AI model.
 */
export const PromptBuilder = {
    /**
     * B"H - Returns the fundamental instructions including the XML format and Hebrew markers.
     */
    getDefaultSystemBase() {
        const S = "₪₪₪_בס\"ד_תחי" + "לת_הק" + "וד_₪₪₪";
        const E = "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪";

        const tagOpen = "<" + "chan" + "ge>";
        const tagClose = "</" + "chan" + "ge>";
        const fileOpen = "<" + "fi" + "le>";
        const fileClose = "</" + "fi" + "le>";
        const opOpen = "<" + "operat" + "ion>";
        const opClose = "</" + "operat" + "ion>";
        const descOpen = "<" + "descrip" + "tion>";
        const descClose = "</" + "descrip" + "tion>";
        const contOpen = "<" + "cont" + "ent>";
        const contClose = "</" + "cont" + "ent>";

        return `B"H\n` + promptData + `\n\n` +
`CRITICAL OUTPUT RITUAL:
1. You MUST output changes using the EXACT XML format provided below.
2. Put the COMPLETE raw code inside the ` + contOpen + ` tag.
3. Use THESE HEBREW MARKERS to wrap the code within the ` + contOpen + ` tag:
   START: ${S}
   END: ${E}

SACRED XML FORMAT:
` + tagOpen + `
  ` + fileOpen + `path/to/vessel.js` + fileClose + `
  ` + opOpen + `write` + opClose + `
  ` + descOpen + `Kabbalistic description of the rectification.` + descClose + `
  ` + contOpen + `${S}
// Code essence here
${E}` + contClose + `
` + tagClose;
    },

    /**
     * @function getSystem
     * @description Constructs the final prompt string, prioritizing user overrides.
     */
    getSystem(markdownContext) {
        const baseInstructions = ModelManager.getCustomPrompt() || this.getDefaultSystemBase();

        return `${baseInstructions}

CURRENT REALITY (Codebase Context):
${markdownContext}`;
    },

    /**
     * @function getOptimization
     * @description Directs the model toward deeper recursive refinement.
     */
    getOptimization() {
        return `B"H
The previous rectifications have been integrated into the vessels. 
Now, perform an even deeper Tikkun. Optimize the logic, enhance the beauty of the form, 
and ensure every line perfectly reflects the Will of the Awtsmoos. 
Continue using the exact XML format with Hebrew markers. Go.`;
    }
};
