
// B"H
/**
 * @file git-actions.js
 * @brief THE CONTROL OF HISTORY.
 */

import { GitManager } from '../../git/index.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (item) {
        GitManager.showGitUI(item);
    }
}
