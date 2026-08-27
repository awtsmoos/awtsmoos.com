
// B"H
/**
 * @class CycleShield
 * @description A guardian against recursive dependency loops.
 */
export const CycleShield = {
    shaping: new Set(),
    enter(path) {
        if (this.shaping.has(path)) {
            console.warn(`%c[CycleShield] Loop detected: ${path}. Breaking recursion.`, "color: #ffae57; font-weight: bold;");
            return false;
        }
        this.shaping.add(path);
        return true;
    },
    exit(path) { this.shaping.delete(path); },
    reset() { this.shaping.clear(); }
};
