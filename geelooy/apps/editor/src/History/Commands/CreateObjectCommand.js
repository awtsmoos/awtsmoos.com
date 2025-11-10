// B"H
import { Command } from '../../Core/Command.js';

export class CreateObjectCommand extends Command {
    constructor(objectManager, object, parentUUID) {
        super(); // Pass editor reference if needed
        this.objectManager = objectManager;
        this.object = object; // The object itself (might need serialization later)
        this.objectUUID = object.uuid;
        this.parentUUID = parentUUID || objectManager.scene.uuid; // Default to scene
        this.name = `Create ${object.name || 'Object'}`;
    }

    // CreateObjectCommand.js
    execute() {
        const parent = this.objectManager.getObjectByUUID(this.parentUUID) || this.objectManager.scene;
        let addedObject = null;
        let objectExisted = this.objectManager.getObjectByUUID(this.objectUUID);

        if (!objectExisted) {
             // If it doesn't exist (usual case or redo after undo), add it internally without events
             addedObject = this.objectManager._addObjectInternal(this.object, parent, true, false); // emitEvents = false
             console.log(`B"H CreateObjectCommand execute: Called _addObjectInternal for ${this.object?.name}`);
        } else {
             // If it already exists (e.g., initial add before command stack or complex redo), ensure parent is correct
             console.log(`B"H CreateObjectCommand execute: Object ${this.object?.name} already exists.`);
             addedObject = this.object; // Use the existing object reference
             if (addedObject.parent !== parent) {
                 console.log(`B"H CreateObjectCommand execute: Reparenting existing ${addedObject.name} to ${parent.name || 'Scene'}`);
                 parent.add(addedObject); // Ensure parent is correct
             }
        }

        // After ensuring the object is in the scene and referenced by addedObject:
        if (addedObject) {
             // 1. Select the object: This will emit the 'selectionChanged' event correctly.
             this.objectManager.selectObject(this.objectUUID, true);

             // 2. Emit events specific to this command *after* selection is done.
             // Check if the object was newly added vs just reparented
             if (!objectExisted) {
                  this.objectManager.eventEmitter.emit('objectAdded', addedObject);
             }
             this.objectManager.eventEmitter.emit('sceneGraphChanged'); // Always signal potential structure change
        } else {
             console.error(`CreateObjectCommand execute: Failed to add or find object ${this.objectUUID}`);
        }
         console.log(`Executed CreateObjectCommand: ${this.object?.name}`);
    }

    undo() {
        // Remove the object using the manager's internal method without creating a new command
        this.objectManager._removeObjectInternal(this.objectUUID, false);
        console.log(`Undone CreateObjectCommand: ${this.object.name}`);
    }

     // Optional: Serialize object state if needed for complex scenarios
     // toJSON() { ... }
     // fromJSON(json, editor) { ... }
}