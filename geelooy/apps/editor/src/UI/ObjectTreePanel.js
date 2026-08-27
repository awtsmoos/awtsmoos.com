// B"H
import { HTML } from '../Core/HTML.js';
import { BasePanel } from './BasePanel.js';

export class ObjectTreePanel extends BasePanel {
    constructor(eventEmitter, objectManager) {
        super('object-tree-panel', 'Scene Hierarchy', eventEmitter);
        this.objectManager = objectManager;
        this.objectListElement = null;

        this.populateContent();

        this.eventEmitter.on('sceneGraphChanged', () => this.updateTree());
        this.eventEmitter.on('selectionChanged', () => this.updateSelectionHighlight());
        this.eventEmitter.on('objectRenamed', () => this.updateTree());
    }

    populateContent() {
        this.objectListElement = HTML.create({ tag: 'ul', class: 'object-tree' });
        this.setContent(this.objectListElement);
        this.updateTree();
    }
    
    // ** This method is now slightly modified to preserve scroll position **
    updateTree() {
        const roots = this.objectManager.scene.children.filter(
            obj => obj.userData?.isSelectable
        );
        const scrollPos = this.contentElement.scrollTop; // Remember scroll position
        HTML.clear(this.objectListElement);
        roots.forEach(obj => {
            this.objectListElement.appendChild(this._createTreeItem(obj));
        });
        this.updateSelectionHighlight();
        this.contentElement.scrollTop = scrollPos; // Restore scroll position
    }

    // ** This method contains the fix for the expand/collapse button **
    _createTreeItem(object) {
        const hasChildren = object.children.some(child => child.userData?.isSelectable);
        // An item is collapsed only if its userData flag is explicitly true. Defaults to expanded.
        const isCollapsed = object.userData.treeCollapsed === true;

        const headerContent = [];

        if (hasChildren) {
            headerContent.push(HTML.create({
                tag: 'button', class: 'toggle-btn', text: isCollapsed ? '▸' : '▾',
                on: {
                    click: (e) => {
                        e.stopPropagation();
                        // ** FIX: Read the current state directly from the object **
                        const isCurrentlyCollapsed = object.userData.treeCollapsed === true;
                        object.userData.treeCollapsed = !isCurrentlyCollapsed; // Toggle the stored state

                        const button = e.target;
                        const listItem = button.closest('li.object-tree-item');
                        
                        // Update the button for the *new* state
                        button.textContent = isCurrentlyCollapsed ? '▾' : '▸';

                        if (isCurrentlyCollapsed) {
                            // If it WAS collapsed, we are now EXPANDING.
                            // Create and append the list of children.
                            const childrenList = HTML.create({ tag: 'ul', class: 'object-tree-children' });
                            object.children.forEach(child => {
                                if (child.userData?.isSelectable) {
                                    childrenList.appendChild(this._createTreeItem(child));
                                }
                            });
                            listItem.appendChild(childrenList);
                        } else {
                            // If it WAS expanded, we are now COLLAPSING.
                            // Find and remove the list of children.
                            const childrenList = listItem.querySelector('ul.object-tree-children');
                            if (childrenList) {
                                listItem.removeChild(childrenList);
                            }
                        }
                        this.updateSelectionHighlight(); // Re-apply selection styles
                    }
                }
            }));
        } else {
            headerContent.push(HTML.create({ tag: 'span', class: 'toggle-placeholder' }));
        }
        
        let iconType = '🧊';
        if (object.isGroup) iconType = '📁';
        else if (object.isLight) iconType = '💡';
        else if (object.isCamera) iconType = '📷';
        headerContent.push(HTML.create({ tag: 'span', class: 'icon', text: iconType }));

        headerContent.push(HTML.create({
            tag: 'span', class: 'item-name', text: object.name || `Unnamed`
        }));
        
        const headerDiv = HTML.create({
            tag: 'div', class: 'tree-item-header', children: headerContent,
            on: { click: () => this.eventEmitter.emit('objectClicked', object) }
        });

        const listItem = HTML.create({
            tag: 'li', class: 'object-tree-item', attrs: { 'data-uuid': object.uuid },
            children: [headerDiv]
        });

        // If it should be expanded on initial render, add the children now
        if (hasChildren && !isCollapsed) {
            const childrenList = HTML.create({ tag: 'ul', class: 'object-tree-children' });
            object.children.forEach(child => {
                if (child.userData?.isSelectable) {
                    childrenList.appendChild(this._createTreeItem(child));
                }
            });
            listItem.appendChild(childrenList);
        }
        return listItem;
    }

    updateSelectionHighlight() {
        const selectedUUIDs = this.objectManager.getSelectedObjectUUIDs();
        const activeUUID = this.objectManager.activeObjectUUID;

        this.objectListElement.querySelectorAll('li.object-tree-item').forEach(li => {
            const uuid = li.getAttribute('data-uuid');
            const header = li.querySelector('.tree-item-header');
            if (header) {
                const isSelected = selectedUUIDs.includes(uuid);
                const isActive = uuid === activeUUID;
                header.classList.toggle('selected', isSelected && !isActive);
                header.classList.toggle('active', isActive);
            }
        });
    }
}



