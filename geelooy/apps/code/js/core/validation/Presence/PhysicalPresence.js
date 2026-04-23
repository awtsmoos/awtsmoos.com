
// B"H
/**
 * @file PhysicalPresence.js
 * @brief Probes the physical layer of Asiyah.
 */
import { FileSystemProvider } from '../../../fs-provider.js';

export const PhysicalPresence = {
    /**
     * @async
     * @function exists
     * @description Attempts to reach the file on disk.
     */
    async exists(fullContextItem) {
        try {
            if (fullContextItem.kind === 'directory') {
                const res = await FileSystemProvider.list(fullContextItem);
                return !!res;
            } else {
                const res = await FileSystemProvider.read(fullContextItem);
                return res !== null && res !== undefined;
            }
        } catch (e) {
            return false;
        }
    }
};
