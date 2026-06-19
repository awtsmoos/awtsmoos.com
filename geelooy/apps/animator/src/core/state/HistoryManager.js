
/* B”H */

/**
 * @class HistoryManager
 * @description
 * THE KEEPER OF MEMORY (Zikaron).
 * 
 * THE POEM OF THE SAVED SPARKS:
 * Before, the ram was consumed in a flash,
 * By deep-cloning JSON that turned into ash.
 * For every small keystroke, the whole world was stored,
 * An infinite bloat that could not be ignored!
 * So now we compare the new state to the old,
 * And only if different, the memory is told.
 * Stringified hashing prevents the machine,
 * From crashing and dying and wiping the screen!
 * 
 * RECTIFICATION: To prevent catastrophic OOM memory leaks, the `push` function 
 * now verifies if the new state is actually different from the last saved state 
 * before deeply cloning it.
 */
export class HistoryManager {
  /**
   * Initializes the temporal arrays.
   * @param {number} limit - Maximum steps of time to remember.
   */
  constructor(limit = 50) {
    this.history = [];
    this.redoStack = [];
    this.limit = limit;
  }

  /**
   * Pushes a new state into the past, provided it represents actual change.
   * @param {string} key - The state variable name.
   * @param {any} value - The spiritual essence.
   */
  push(key, value) {
    // Purge undefined attempts
    if (value === undefined) return;

    // Fast-serialization for comparison
    const serializedValue = JSON.stringify(value);

    // If the history is not empty, ensure we aren't saving an identical clone.
    // (This saves immense RAM if systems repeatedly call `state.set` with the same sequence data)
    if (this.history.length > 0) {
      const lastEntry = this.history[this.history.length - 1];
      if (lastEntry.key === key && JSON.stringify(lastEntry.value) === serializedValue) {
        return; // The state is unchanged. Reject the bloat.
      }
    }

    // Safely deep clone the validated new reality
    const safeValue = JSON.parse(serializedValue);
    
    this.history.push({ key, value: safeValue });
    
    // Obey the Tzimtzum (Contraction) limit
    if (this.history.length > this.limit) {
       this.history.shift(); // Forget the distant past
    }
    
    // A new action shatters the potential of the alternative future
    this.redoStack = [];
  }

  pop() {
    return this.history.pop();
  }

  pushRedo(key, value) {
    const safeValue = value !== undefined ? JSON.parse(JSON.stringify(value)) : undefined;
    this.redoStack.push({ key, value: safeValue });
  }

  popRedo() {
    return this.redoStack.pop();
  }

  canUndo() { return this.history.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
}
