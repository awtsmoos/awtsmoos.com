
// B"H
/**
 * @file LockedAccessError.js
 * @brief An unmistakable flag marking an access failure on mobile or strictly permitted systems.
 */

export class LockedAccessError extends Error {
    constructor(workspaceInfo, originalErrorMsg) {
        super(`Access Denied to realm: ${workspaceInfo.name || workspaceInfo.path}. Origin constraint: ${originalErrorMsg}`);
        this.name = "LockedAccessError";
        this.workspaceId = workspaceInfo.id || workspaceInfo.workspaceId;
    }
}
