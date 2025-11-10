// B"H
import { HTML } from '../Core/HTML.js';
import { BasePanel } from './BasePanel.js';

export class ObjectTreePanel extends BasePanel {
    constructor(eventEmitter, objectManager) {
        super('object-tree-panel', 'Scene Hierarchy', eventEmitter);
        this.objectManager = objectManager;
        this.objectListElement = null; // The <ul> element

        this.populateContent(); // Original code had this missing call, ensure it's present.

        // Listen for changes that require tree updates
        this.eventEmitter.on('sceneGraphChanged', () => this.updateTree());
        // Use selectionChanged to update highlight AND ensure parents are expanded
        this.eventEmitter.on('selectionChanged', (uuids) => this.updateSelectionHighlight(uuids));
        this.eventEmitter.on('objectRenamed', (object) => this.updateTree()); // Could optimize later
    }

    populateContent() {
        this.objectListElement = HTML.create({ tag: 'ul', class: 'object-tree' });
        this.setContent(this.objectListElement);
        // Initial population when ready (might need scene objects)
        this.updateTree(); // Call updateTree initially
    }

    updateTree(rootObjects = null) {
        // If specific roots aren't passed, get them from the manager's scene children
        // Filter only objects managed by ObjectManager (having userData.isSelectable is a good proxy)
        const roots = rootObjects || this.objectManager.scene.children.filter(
            obj => obj.userData?.isSelectable !== undefined // Check if managed
        );
        HTML.clear(this.objectListElement);

        roots.forEach(obj => {
            // Only add top-level selectable objects to the root of the tree
            if (obj.userData?.isSelectable) {
                 this.objectListElement.appendChild(this._createTreeItem(obj));
            }
        });
        this.updateSelectionHighlight(); // Re-apply selection after rebuild
    }

    _createTreeItem(object) {
         // Check for children that ARE selectable according to ObjectManager's standard
        const hasSelectableChildren = object.children.some(child => child.userData?.isSelectable);
        const isCollapsed = object.userData.treeCollapsed === undefined ? !hasSelectableChildren : object.userData.treeCollapsed; // Default collapsed if no selectable children, else persisted state


        const itemContent = [];

        // Toggle Button - only if it has SELECTABLE children
        if (hasSelectableChildren) {
            itemContent.push(HTML.create({
                tag: 'button',
                class: 'toggle-btn',
                text: isCollapsed ? '▸' : '▾', // Better icons
                style: { width: '16px', border: 'none', background: 'none', cursor: 'pointer', padding: '0 4px 0 0', 'font-family':'monospace' },
                on: {
                    click: (e) => {
                        e.stopPropagation(); // Prevent item click event
                        object.userData.treeCollapsed = !isCollapsed;
                        // Manually toggle the children list visibility and button text
                        const childrenList = listItem.querySelector('ul');
                        if (childrenList) {
                            childrenList.style.display = object.userData.treeCollapsed ? 'none' : '';
                        }
                        e.target.textContent = object.userData.treeCollapsed ? '▸' : '▾';
                        listItem.classList.toggle('collapsed', object.userData.treeCollapsed);

                    }
                }
            }));
        } else {
             // Placeholder for alignment if no children
             itemContent.push(HTML.create({ tag: 'span', style: { display: 'inline-block', width: '16px' } }));
        }

        // Icon
        let iconType = '🧊'; // Default Mesh/Unknown
        if (object.isGroup) iconType = '📁'; // Group
        else if (object.isLight) iconType = '💡';
        else if (object.isCamera) iconType = '📷';
        else if (object.isMesh) { // More specific mesh types
            const geomType = object.geometry?.type;
            if (geomType?.includes('Sphere')) iconType = '⚪';
            else if (geomType?.includes('Plane')) iconType = '⬜';
            else if (geomType?.includes('Cylinder')) iconType = ' cilindro'; // Placeholder, find better icon
            else if (geomType?.includes('Cone')) iconType = '🔼';
            else if (geomType?.includes('Torus')) iconType = '🍩';
            else iconType = '🧊'; // Default Box/Mesh
        }
         // Add more icons...
         itemContent.push(HTML.create({tag: 'span', class: 'icon', text: iconType, style: {'margin-right': '4px'} }));


        // Name
        itemContent.push(HTML.create({
            tag: 'span',
            class: 'item-name',
            text: object.name || `Unnamed (${object.type})`
        }));


        const listItem = HTML.create({
            tag: 'li',
            class: ['object-tree-item', isCollapsed ? 'collapsed' : ''],
            attrs: { 'data-uuid': object.uuid },
            children: itemContent,
            on: {
                click: (e) => {
                    // --- IMPORTANT: Always emit objectClicked ---
                    // Let ObjectManager handle single vs multi select logic based on its state
                    this.eventEmitter.emit('objectClicked', object);
                }
            }
        });

        // Add children recursively IF they are selectable
        if (hasSelectableChildren) {
            const childrenList = HTML.create({ tag: 'ul', style: { 'padding-left': '20px' } }); // Indent children
            object.children.forEach(child => {
                 // Only add selectable children to the tree
                 if (child.userData?.isSelectable) {
                    childrenList.appendChild(this._createTreeItem(child));
                 }
            });
            listItem.appendChild(childrenList);
            // Ensure child list visibility matches collapsed state initially
             childrenList.style.display = isCollapsed ? 'none' : '';
        }

        // No need for listItem.userData = { objectRef: object }; data-uuid is sufficient

        return listItem;
    }

    // This method is now just for visual update, state is handled by click listener
    /*
    toggleItemCollapse(listItem, collapsed) {
        listItem.classList.toggle('collapsed', collapsed);
        const toggleBtn = listItem.querySelector('.toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = collapsed ? '▸' : '▾';
        }
        const childrenList = listItem.querySelector('ul');
        if (childrenList) {
            childrenList.style.display = collapsed ? 'none' : '';
        }
    }
    */

    updateSelectionHighlight(selectedUUIDs = null) {
        // Use the passed UUIDs or get fresh ones if null
        const currentSelection = selectedUUIDs === null ? this.objectManager.getSelectedObjectUUIDs() : selectedUUIDs;
        const items = this.objectListElement.querySelectorAll('li.object-tree-item');

        items.forEach(item => {
            const uuid = item.getAttribute('data-uuid');
            const isSelected = currentSelection.includes(uuid);
            item.classList.toggle('selected', isSelected);

            // --- Ensure ancestors are expanded if selected ---
            if (isSelected) {
                let parentLi = item.parentElement?.closest('li.object-tree-item');
                while(parentLi) {
                    const parentUUID = parentLi.getAttribute('data-uuid');
                    const parentObj = this.objectManager.getObjectByUUID(parentUUID);

                    if(parentObj && parentObj.userData.treeCollapsed === true) {
                         // Update state and visual appearance if collapsed
                         parentObj.userData.treeCollapsed = false; // Update data model
                         const toggleBtn = parentLi.querySelector('.toggle-btn');
                         if (toggleBtn) toggleBtn.textContent = '▾'; // Update button
                         const childrenList = parentLi.querySelector('ul');
                         if (childrenList) childrenList.style.display = ''; // Show children UL
                         parentLi.classList.remove('collapsed');
                    }
                    parentLi = parentLi.parentElement?.closest('li.object-tree-item');
                }
            }
        });
    }
}