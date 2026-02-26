
// B"H
/**
 * @file refresh.js
 * @brief THE RENEWAL OF SIGHT.
 */

import { Workspaces } from '../../workspaces/index.js';

export default async function run() {
    await Workspaces.render();
}
