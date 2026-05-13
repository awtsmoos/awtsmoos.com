// B"H
/**
 * @file open-virtual-os.js
 * @description Opens the virtual desktop/OS emulator tab rooted at the selected directory.
 */

import { ContextParser } from '../utils/context-parser.js';

export default async function openVirtualOS(context) {
    const item = ContextParser.getItem(context);
    if (!item) return;
    const { VirtualOSManager } = await import('../../virtual-os/index.js');
    return VirtualOSManager.open(item);
}
