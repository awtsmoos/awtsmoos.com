// B"H GroupCommand.js
import { Command } from '../../Core/Command.js';
// Need RemoveObjectCommand potentially if we create/destroy Groups, but not for parent/child
// import { RemoveObjectCommand } from './RemoveObjectCommand.js';

export class GroupCommand extends Command {
    // action: 'group' (original Box Group), 'parent', 'unparent'
    // targetParentUUID: Used only for 'parent' action
    constructor(objectManager, objectUUIDs, action = 'parent', targetParentUUID = null) {
        super();
        this.objectManager = objectManager;
        this.objectUUIDs = [...objectUUIDs]; // All selected UUIDs involved
        this.action = action;
        this.targetParentUUID = targetParentUUID; // For 'parent' action
        this.originalParents = {}; // Store { childUUID: originalParentUUID }
        this.createdGroupUUID = null; // Only used for legacy 'group' action if kept
        this.name = this._getCommandName();

        // Store selection state for restoration on undo/redo
        this.selectionStateBefore = {
             selected: objectManager.getSelectedObjectUUIDs(),
             active: objectManager.activeObjectUUID
        };
        this.selectionStateAfter = null; // Will be set after execute
    }

    _getCommandName() {
        switch (this.action) {
            case 'group': return 'Group Objects'; // Legacy Box Grouping
            case 'parent': return 'Parent Objects';
            case 'unparent': return 'Unparent Objects';
            default: return 'Group/Parent Action';
        }
    }

    execute() {
        switch (this.action) {
            case 'parent': {
                const childUUIDs = this.objectUUIDs.filter(uuid => uuid !== this.targetParentUUID);
                const result = this.objectManager._reparentObjectsInternal(this.targetParentUUID, childUUIDs);
                if (result.success) {
                    this.originalParents = result.originalParents; // Store for undo
                    // Selection remains the same
                    this.selectionStateAfter = this.selectionStateBefore;
                     // Ensure scene graph change event is fired
                     this.objectManager.eventEmitter.emit('sceneGraphChanged');
                } else {
                    console.error("Parenting failed during command execution.");
                     this.selectionStateAfter = this.selectionStateBefore; // Keep old state on fail
                }
                break;
            }
            case 'unparent': {
                // objectUUIDs are the children to unparent in this case
                const result = this.objectManager._unparentObjectsInternal(this.objectUUIDs);
                 if (result.success) {
                     this.originalParents = result.originalParents; // Store for undo (redo)
                     // Selection remains the same
                     this.selectionStateAfter = this.selectionStateBefore;
                      // Ensure scene graph change event is fired
                      this.objectManager.eventEmitter.emit('sceneGraphChanged');
                 } else {
                     console.error("Unparenting failed during command execution.");
                      this.selectionStateAfter = this.selectionStateBefore; // Keep old state on fail
                 }
                break;
            }
             case 'group': // Keep legacy Group Box logic if needed
                 console.warn("Legacy 'group' action in GroupCommand not fully updated for parent/child focus.");
                 // Original _groupObjectsInternal logic would go here
                 // const groupData = this.objectManager._groupObjectsInternal(this.objectUUIDs);
                 // if (groupData && groupData.group) {
                 //    this.createdGroupUUID = groupData.group.uuid;
                 //    this.originalParents = groupData.originalParents;
                 //    this.selectionStateAfter = { selected: [this.createdGroupUUID], active: this.createdGroupUUID };
                 //    this.objectManager.selectObject(this.createdGroupUUID, true); // Select group
                 // }
                 break;

            default:
                console.error(`Unknown GroupCommand action: ${this.action}`);
        }
        console.log(`Executed ${this.name}`);
    }

    undo() {
         console.log(`Undoing ${this.name}`);
         switch (this.action) {
            case 'parent': {
                 // Undo parenting: Move children back to their original parents
                 const childrenToMoveBack = Object.keys(this.originalParents);
                 let success = true;
                 childrenToMoveBack.forEach(childUUID => {
                     const originalParentUUID = this.originalParents[childUUID];
                     const child = this.objectManager.getObjectByUUID(childUUID);
                     const originalParent = this.objectManager.getObjectByUUID(originalParentUUID) || this.objectManager.scene; // Fallback to scene

                     if (child && originalParent) {
                         try {
                            originalParent.attach(child);
                         } catch(e) { success = false; console.error("Error undoing parent:", e); }
                     } else { success = false; console.error("Cannot find child or original parent for undo parent.");}
                 });
                  if (success) {
                      this.objectManager.eventEmitter.emit('sceneGraphChanged');
                  }
                 break;
            }
            case 'unparent': {
                // Undo unparenting: Move children back to the parent they were moved from
                 const childrenToMoveBack = Object.keys(this.originalParents);
                 let success = true;
                 childrenToMoveBack.forEach(childUUID => {
                     const originalParentUUID = this.originalParents[childUUID]; // Parent they were removed from
                     const child = this.objectManager.getObjectByUUID(childUUID);
                     const originalParent = this.objectManager.getObjectByUUID(originalParentUUID);

                     if (child && originalParent) {
                         try {
                             originalParent.attach(child);
                         } catch (e) { success = false; console.error("Error undoing unparent:", e); }
                     } else { success = false; console.error("Cannot find child or original parent for undo unparent."); }
                 });
                 if (success) {
                     this.objectManager.eventEmitter.emit('sceneGraphChanged');
                 }
                 break;
            }
             case 'group': // Undo legacy Group Box
                  console.warn("Undo for legacy 'group' action not fully updated.");
                  // Original _ungroupObjectInternal logic would go here, potentially followed by reattaching to original parents
                  // if (this.createdGroupUUID) {
                  //    const ungroupResult = this.objectManager._ungroupObjectInternal(this.createdGroupUUID);
                  //    // Reattach ungroupResult.movedChildren to this.originalParents
                  //    this.createdGroupUUID = null;
                  // }
                  break;

            default:
                 console.error(`Unknown GroupCommand action for undo: ${this.action}`);
        }
         // Restore previous selection state
         this.objectManager.selectedObjectUUIDs = new Set(this.selectionStateBefore.selected);
         this.objectManager.activeObjectUUID = this.selectionStateBefore.active;
         this.objectManager.emitSelectionChange(); // Notify UI of selection restoration
    }
}