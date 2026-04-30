
// B"H
/**
 * @class EntityIdGenerator
 * @description
 * 🏷️ THE BESTOWER OF NAMES 🏷️
 * 
 * Every creation requires a unique name to exist in the database of the Awtsmoos.
 */
export default class EntityIdGenerator {
    static _counter = 0;

    static generate(prefix = "Entity") {
        this._counter++;
        return `${prefix}_${Date.now()}_${this._counter}`;
    }
}
