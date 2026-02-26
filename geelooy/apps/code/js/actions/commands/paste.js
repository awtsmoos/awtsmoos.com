
// B"H
/**
 * @file paste.js
 * @brief THE MANIFESTATION OF COPIED ESSENCE.
 */

import { FileOperations } from '../../file-operations.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (item) {
        FileOperations.paste(item);
    }
}
