
/**
 * B"H
 * @module InlineStateAmbassador
 * @chapter Orchestrating Departure
 */

import { updateQueryStringParameter } from "../../functions/utils.js";
import { commentaryStore } from "../state/store.js";
import { getInlineAliases as _fetchActive } from "./providers/StateProvider.js";

/**
 * @function hideCommentsInline
 * @description 
 * Orchestrates the cleanup when an Alias exits the Margin.
 */
export function hideCommentsInline(alias) {
    if (!alias) return;
    
    let list = _fetchActive();
    const coordinateInRegistry = list.indexOf(alias);
    
    if (coordinateInRegistry > -1) {
        list.splice(coordinateInRegistry, 1);
        const updatedHeavensValue = list.length ? JSON.stringify(list) : null;
        updateQueryStringParameter("inline", updatedHeavensValue);
    }
    
    // Purify the local Reshimu in the Store
    const searchPrefix = `loaded-${alias}-`;
    Object.keys(commentaryStore.loadedInlineVerses).forEach(vesselKey => {
        if (vesselKey.startsWith(searchPrefix)) {
            delete commentaryStore.loadedInlineVerses[vesselKey];
        }
    });
}
