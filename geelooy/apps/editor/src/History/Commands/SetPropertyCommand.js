// B"H
import { Command } from '../../Core/Command.js';
import { Track } from '../../Timeline/Track.js'; // For the helper function

export class SetPropertyCommand extends Command {
    constructor(eventEmitter, objectUUID, propertyPath, oldValue, newValue) {
        super();
        this.eventEmitter = eventEmitter;
        this.objectUUID = objectUUID;
        this.propertyPath = propertyPath;
        this.oldValue = this._clone(oldValue);
        this.newValue = this._clone(newValue);
        this.name = `Set ${propertyPath}`;
    }

    _clone(val) {
        if (val && typeof val.clone === 'function') {
            return val.clone();
        }
        return val;
    }

    execute() {
        const object = window.MWA.objectManager.getObjectByUUID(this.objectUUID);
        if (object) {
            Track.setObjectPropertyValue(object, this.propertyPath, this.newValue);
            this.eventEmitter.emit('objectTransformed', [object]); // Notify UI to update
        }
    }

    undo() {
        const object = window.MWA.objectManager.getObjectByUUID(this.objectUUID);
        if (object) {
            Track.setObjectPropertyValue(object, this.propertyPath, this.oldValue);
            this.eventEmitter.emit('objectTransformed', [object]); // Notify UI to update
        }
    }
}