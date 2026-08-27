
// B"H
/**
 * @file select-connected.js
 * @brief THE CALL OF THE INVISIBLE THREADS.
 * 
 * THE POEM OF THE GATHERING:
 * One file is but a drop within the vast design,
 * But when the seeker runs, the connections intertwine.
 * We cast the net of parsing across the open sea,
 * To gather all the vessels that form the living tree.
 * They light up in the darkness, selected one by one,
 * Revealing how the Awtsmoos makes the many into One.
 */

import { ItemResolver } from '../utils/itemResolver.js';
import { ConnectedSeeker } from '../../selection/connected-seeker/index.js';
import { UI } from '../../ui.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    
    if (!item || item.kind !== 'file') {
        UI.showToast("B\"H - The Seeker requires a single file to begin the trace.", "warning");
        return;
    }

    console.log(`[SelectConnected] B"H - Initiating trace from: ${item.path}`);
    ConnectedSeeker.ignite(item);
}
