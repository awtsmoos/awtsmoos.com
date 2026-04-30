
// B"H
import { TabIdentityManager } from './identity/TabIdentityManager.js';

export const TabPathRitual = {
    getUniquePath(item) {
        return TabIdentityManager.generateHash(item);
    }
};
