
// B"H
/**
 * @file master-prompt.js
 * @brief The Holy Blueprint of AI Personality.
 */

import promptData from '../promptData.js';
import { PR } from '../parser/constants.js';

export const MasterPrompt = {
    getSystemBase() {
        return `B"H\n` + promptData + `\n\n` +
`CRITICAL OUTPUT RITUAL:
1. You MUST output changes using the EXACT XML format provided below.
2. Put the COMPLETE raw code inside the ` + PR.cO + ` tag.
3. Use THESE HEBREW MARKERS to wrap the code within the ` + PR.cO + ` tag:
   START: ${PR.S}
   END: ${PR.E}

SACRED XML FORMAT:
` + PR.tO + `
  ` + PR.fO + `path/to/vessel.js` + PR.fC + `
  ` + PR.oO + `write` + oC + `
  ` + PR.dO + `Kabbalistic description of the rectification.` + PR.dC + `
  ` + PR.cO + `${PR.S}
// Code essence here
${PR.E}` + PR.cC + `
` + PR.tC;
    }
};
