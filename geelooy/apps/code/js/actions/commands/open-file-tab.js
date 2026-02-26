
// B"H
/**
 * @file open-file-tab.js
 * @brief OPENING THE SCROLL.
 */

import { Tabs } from '../../tabs/index.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (item) {
        Tabs.create(item);
    }
}
