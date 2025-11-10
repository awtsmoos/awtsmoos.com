// B"H
/**
 * Base class for Undo/Redo commands.
 */
export class Command {
    constructor(editor) {
        this.editor = editor; // Reference to the main app or relevant managers if needed
        this.type = this.constructor.name; // e.g., 'MoveCommand'
        this.id = Math.random().toString(36).substr(2, 9); // Unique ID for the command instance
        this.name = ''; // User-friendly name for the action (e.g., 'Move Object')
    }

    /**
     * Executes the command. Must be implemented by subclasses.
     */
    execute() {
        throw new Error('Command.execute() must be implemented.');
    }

    /**
     * Undoes the command. Must be implemented by subclasses.
     */
    undo() {
        throw new Error('Command.undo() must be implemented.');
    }

    /**
     * Optional method to update related UI elements after execution or undo.
     */
    updateUI() {
        // Subclasses can implement this if needed
    }
}