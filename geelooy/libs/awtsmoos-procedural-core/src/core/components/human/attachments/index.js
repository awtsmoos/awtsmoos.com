
// B"H
/**
 * @file index.js (human attachments)
 * @brief The Master Gatherer of Facial and Cranial forms.
 */

import { attachYarmulke } from './yarmulkeAttacher.js';
import { attachEyes } from './eyeAttacher.js';
import { attachBrows } from './browAttacher.js';
import { attachHair } from './hairAttacher.js';

export function manifestHeadAttachments(id, sceneTracksObj, headMetrics) {
    const eyes = attachEyes(id, sceneTracksObj, headMetrics);
    const brows = attachBrows(id, headMetrics);
    const yarmulke = attachYarmulke(id, headMetrics);
    const hair = attachHair(id, headMetrics);

    return[
        ...eyes,
        ...brows,
        hair, 
        yarmulke
    ];
}
