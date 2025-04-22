// B"H
/**
 * Manages the undo/redo stack.
 */
export class HistoryManager {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 50; // Limit history size

        this.eventEmitter.on('undoRequest', this.undo.bind(this));
        this.eventEmitter.on('redoRequest', this.redo.bind(this));

        console.log("B\"H - HistoryManager Initialized");
    }

    /**
     * Adds a command to the undo stack and executes it.
     * Clears the redo stack.
     * @param {Command} command - The command to add.
     */
    add(command) {
        // Execute the command first
        try {
            command.execute();
        } catch (error) {
            console.error(`Error executing command ${command.type}:`, error);
            this.eventEmitter.emit('error', `Failed to execute action: ${command.name || command.type}`);
            return; // Don't add failed commands to history
        }

        this.undoStack.push(command);
        this.redoStack = []; // Clear redo stack on new action

        // Limit history size
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift(); // Remove the oldest command
        }

        this.emitHistoryChange();
        // Optional: Update UI related to the command
        command.updateUI();

         console.log(`Command added: ${command.name || command.type} (Undo: ${this.undoStack.length}, Redo: ${this.redoStack.length})`);
    }

    /**
     * Undoes the last command.
     */
    undo() {
        const command = this.undoStack.pop();
        if (!command) {
            console.log("Nothing to undo.");
            return;
        }

        try {
            command.undo();
            this.redoStack.push(command);
            this.emitHistoryChange();
            command.updateUI(); // Update UI after undo
            console.log(`Command undone: ${command.name || command.type} (Undo: ${this.undoStack.length}, Redo: ${this.redoStack.length})`);
        } catch (error) {
            console.error(`Error undoing command ${command.type}:`, error);
            this.eventEmitter.emit('error', `Failed to undo action: ${command.name || command.type}`);
            // Attempt to push command back onto undo stack? Or leave state inconsistent?
            // For now, just log error. The command might be partially undone.
             this.emitHistoryChange(); // Still emit change even on error
        }
    }

    /**
     * Redoes the last undone command.
     */
    redo() {
        const command = this.redoStack.pop();
        if (!command) {
            console.log("Nothing to redo.");
            return;
        }

        try {
            command.execute(); // Re-execute the command
            this.undoStack.push(command);
            this.emitHistoryChange();
            command.updateUI(); // Update UI after redo
             console.log(`Command redone: ${command.name || command.type} (Undo: ${this.undoStack.length}, Redo: ${this.redoStack.length})`);
        } catch (error) {
            console.error(`Error redoing command ${command.type}:`, error);
            this.eventEmitter.emit('error', `Failed to redo action: ${command.name || command.type}`);
             // Attempt to push back to redo stack?
             this.emitHistoryChange();
        }
    }

    /**
     * Clears the entire history.
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.emitHistoryChange();
        console.log("History cleared.");
    }

    /**
     * Emits an event indicating that the history state has changed.
     */
    emitHistoryChange() {
        this.eventEmitter.emit('historyChanged', {
            canUndo: this.undoStack.length > 0,
            canRedo: this.redoStack.length > 0,
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length
        });
    }
}