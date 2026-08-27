
// B"H
import { WorkspaceTreeRenderer } from '../../../workspaces/tree-rendering.js';

export const VibeSidebarTree = {
    async refresh(container, rootItem, controller) {
        const treeContainer = container.querySelector('#vibe-tree-container');
        if (!treeContainer) return;
        
        treeContainer.innerHTML = '<ul class="workspace-tree" style="padding-left:0;"></ul>';
        const ul = treeContainer.querySelector('ul');
        
        await WorkspaceTreeRenderer.renderTree(ul, rootItem, 0, true, {
            onFileClick: (item) => controller.previewFile(null, item.path)
        });
    }
};
