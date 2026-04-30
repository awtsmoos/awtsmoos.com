
// B"H
/**
 * @class DragLogger
 * @description
 * 📜 CHAPTER 1: THE SCRIBE OF MOVEMENT (NETZACH) 📜
 * 
 * "And the actions of man are recorded in the book."
 * When a user drags a vessel, it is a physical representation of their Will (Ratzon).
 * We must monitor and log this transfer of energy from one point of the matrix to another.
 * This logger paints the console with the intense colors of creation, revealing the 
 * underlying divine mechanics of the drag system.
 */
export default class DragLogger {
    /**
     * @method log
     * @description Emits a radiant message into the developer console.
     * @param {string} level - INFO, ACTION, or CRITICAL.
     * @param {string} message - The spoken word.
     * @param {any} [data] - Optional physical data to inspect.
     */
    static log(level, message, data = null) {
        const levels = {
            'INFO': 'color: #00ffed; font-weight: bold;',
            'ACTION': 'color: #ff00ea; font-weight: bold; font-size: 1.1em; text-shadow: 0 0 5px #ff00ea;',
            'CRITICAL': 'color: #ff4757; font-weight: 900; background: #220000; padding: 4px; border: 1px solid red;'
        };
        
        const prefix = 'B"H - ⚖️[DRAG SYSTEM]';
        
        if (data) {
            console.log('%c' + prefix + ' ' + message, levels[level] || levels['INFO'], data);
        } else {
            console.log('%c' + prefix + ' ' + message, levels[level] || levels['INFO']);
        }
    }
}
