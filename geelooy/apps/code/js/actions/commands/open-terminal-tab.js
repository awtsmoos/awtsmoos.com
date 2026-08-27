
// B"H
/**
 * @file open-terminal-tab.js
 * @brief Opens a new system-level Terminal tab.
 */

import { Terminal } from '../../terminal/index.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    console.log("B\"H - Opening Terminal at context:", item);
    Terminal.open(item);
}
