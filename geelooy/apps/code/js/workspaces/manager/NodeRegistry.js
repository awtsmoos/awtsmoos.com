
// B"H
/**
 * @file NodeRegistry.js
 * @brief Maps data sparks to physical DOM elements.
 */

import { State } from '../../state.js';
import { getItemUniquePath } from '../utils.js';

export const NodeRegistry = {
    /**
     * B"H - Registers a manifested vessel.
     */
    register(item, el) {
        const key = getItemUniquePath(item);
        State.domItemMap.set(key, { el, item });
    },

    get(key) {
        return State.domItemMap.get(key);
    },

    clear() {
        State.domItemMap.clear();
    }
};
