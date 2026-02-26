
// B"H
/**
 * @file start-selection.js
 * @brief INITIATION OF THE GATHERING.
 * Starts the visual ritual of selecting multiple items.
 */

import { SelectionManager } from '../../selection-manager.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    // Even if item is null, we can start selection mode (it might just default to global)
    SelectionManager.start(item);
}
