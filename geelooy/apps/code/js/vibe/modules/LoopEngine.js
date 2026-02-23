// B"H
// FILE: js/vibe/modules/LoopEngine.js
import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces.js';

export const LoopEngine = {
    async apply(changeList, workspaceId) {
        var workspace = State.workspaces.find(function(ws) { return ws.id === workspaceId; });
        if (!workspace) return;

        // Track folders that need a refresh
        var foldersToRefresh = {}; 

        for (var i = 0; i < changeList.length; i++) {
            var change = changeList[i];
            try {
                var item = { 
                    workspaceId: workspaceId, 
                    path: change.path, 
                    kind: 'file', 
                    type: workspace.type 
                };

                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item);
                } else {
                    await FileSystemProvider.write(item, change.content);
                }

                // Determine the best folder to refresh
                var parts = change.path.split("/").filter(Boolean);
                if (parts.length > 0) {
                    // We refresh the first folder in the path to ensure the whole branch updates
                    var topFolder = "/" + parts[0];
                    foldersToRefresh[topFolder] = true;
                    
                    // Also refresh the immediate parent for safety
                    parts.pop();
                    var immediateParent = "/" + parts.join("/");
                    foldersToRefresh[immediateParent] = true;
                } else {
                    foldersToRefresh["/"] = true;
                }

            } catch (e) {
                console.error("B\"H - Manifest Error:", e);
            }
        }

        // B"H - Trigger the Refresh Ritual
        var refreshPaths = Object.keys(foldersToRefresh);
        for (var i = 0; i < refreshPaths.length; i++) {
            var p = refreshPaths[i];
            await Workspaces.refreshNode({
                workspaceId: workspaceId,
                path: p,
                kind: 'directory',
                type: workspace.type
            });
        }
        
        // Final refresh of the workspace root to be certain
        await Workspaces.refreshNode({ workspaceId: workspaceId, path: "/", kind: "directory", type: workspace.type });
    }
};