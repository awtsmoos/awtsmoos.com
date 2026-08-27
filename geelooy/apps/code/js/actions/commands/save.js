
// B"H
/**
 * @file save.js
 * @brief THE INSCRIPTION OF MEMORY.
 */

import { FileActions } from '../files.js';

export default async function run(context) {
    // FileActions.save() handles finding the active tab internally
    FileActions.save();
}
