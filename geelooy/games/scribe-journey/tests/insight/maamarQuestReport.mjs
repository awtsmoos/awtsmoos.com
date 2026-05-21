// B"H
// tests/insight/maamarQuestReport.mjs

import { quests } from '../../js/data/quests.js';
import { ADAR_TO_SIVAN_MAAMARIM } from '../../js/data/maamarim/adarToSivan.js';

/**
 * Chapter 3: A maamar that teaches without gameplay is a scroll behind glass.
 * A quest without a source becomes noise. This report binds the teaching to its
 * shlichus and proves every reference has a living target.
 */
function buildMaamarQuestReport() {
    const missingQuestRefs = [];
    const missingMaamarRefs = [];

    for (const maamar of Object.values(ADAR_TO_SIVAN_MAAMARIM)) {
        for (const questId of maamar.questIds || []) {
            if (!quests[questId]) missingQuestRefs.push({ maamarId: maamar.id, questId });
        }
    }

    for (const quest of Object.values(quests)) {
        if (quest.maamarId && !ADAR_TO_SIVAN_MAAMARIM[quest.maamarId]) {
            missingMaamarRefs.push({ questId: quest.id, maamarId: quest.maamarId });
        }
    }

    return {
        maamarCount: Object.keys(ADAR_TO_SIVAN_MAAMARIM).length,
        questCount: Object.keys(quests).length,
        missingQuestRefs,
        missingMaamarRefs
    };
}

console.log(JSON.stringify(buildMaamarQuestReport(), null, 2));
