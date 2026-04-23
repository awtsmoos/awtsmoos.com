
// B"H
const Healer = require('../core/healer.js');

class ObjectReader {
    constructor(flat) { this.flat = flat; }
    read() { return Healer.heal(this.flat); }
}
module.exports = ObjectReader;
