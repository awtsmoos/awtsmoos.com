
// B"H
/**
 * @file open-file-commander-tab.js
 * @brief OPENING THE COMMANDER.
 */

import { FileCommander } from '../../file-commander.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (item) {
        FileCommander.open(item);
    } else {
        FileCommander.open(); // Open root
    }
}
