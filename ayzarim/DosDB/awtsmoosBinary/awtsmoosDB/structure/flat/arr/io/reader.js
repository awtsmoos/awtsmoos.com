
// B"H
const Healer = require('./healer.js');

class ArrayReader {
    constructor(flatArray) { this.flat = flatArray; }
    readSafely() { return Healer.heal(this.flat); }
}
module.exports = ArrayReader;
