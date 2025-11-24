// B"H
import { Command } from '../../Core/Command.js';

export class RemoveObjectCommand extends Command {
    constructor(objectManager, objectToRemove, parentUUID) {
        super();
        this.objectManager = objectManager;
        // Store the object itself for re-adding. Might need serialization for complex cases.
        this.removedObject = objectToRemove;
        this.objectUUID = objectToRemove.uuid;
        this.parentUUID = parentUUID || objectToRemove.parent?.uuid; // Get parent before removal
        this.name = `Remove ${objectToRemove.name || 'Object'}`;
         this.selectionState = objectManager.getSelectedObjectUUIDs(); // Store selection before remove
    }

    execute() {
        // The manager usually calls _removeObjectInternal before adding the command.
        // This execute mainly ensures it's gone if redone.
        if (this.objectManager.getObjectByUUID(this.objectUUID)) {
             this.objectManager._removeObjectInternal(this.objectUUID, false);
        }
        console.log(`Executed RemoveObjectCommand: ${this.removedObject.name}`);
    }

    undo() {
        // Re-add the object using the manager's internal method
        const parent = this.objectManager.getObjectByUUID(this.parentUUID) || this.objectManager.scene;
        this.objectManager._addObjectInternal(this.removedObject, parent, false);

         // Restore selection? This can be complex. For now, just select the re-added object.
         this.objectManager.clearSelection(false);
         this.objectManager.selectObject(this.objectUUID, false); // Select just this one for simplicity
         this.objectManager.emitSelectionChange();
        console.log(`Undone RemoveObjectCommand: ${this.removedObject.name}`);
    }
}