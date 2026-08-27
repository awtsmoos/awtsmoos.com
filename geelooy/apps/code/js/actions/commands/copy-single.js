
// B"H
/**
 * @file copy-single.js
 * @brief CAPTURING THE NAME.
 */

import { ItemResolver } from '../utils/itemResolver.js';
import { UI } from '../../ui.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (item) {
        await navigator.clipboard.writeText(item.name);
        UI.showToast("Copied Name", "success");
    }
}
