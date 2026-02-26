
// B"H
/**
 * @file open-devtools.js
 * @brief THE GATEWAY TO INSPECTION.
 * This vessel is the proper entry point for the 'open-devtools' action,
 * channeling the user's will to the DevToolsOpener.
 */

import { DevToolsOpener } from '../../devtools/open.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    // We resolve the item here to ensure the opener has the most accurate context,
    // even though the opener has its own fallbacks.
    const item = ItemResolver.resolve(context);
    console.log("B\"H - Invoking DevTools Opener for item:", item);
    await DevToolsOpener.open(item);
}
