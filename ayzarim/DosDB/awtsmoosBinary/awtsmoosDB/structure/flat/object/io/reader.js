
// B"H
/**
 * @file reader.js
 * @description Safe physical reads for the FlatObject.
 */
const Healer = require('./healer.js');

class ObjectReader {
    constructor(flatObject) { this.flat = flatObject; }
    
    readSafely() {
        return Healer.heal(this.flat);
    }
}
module.exports = ObjectReader;
