// B"H
const BTreeReader = require('./reader.js');
const BTreeWriter = require('./writer.js');

class NodeIO {
    constructor(btree) {
        this.btree = btree;
        this.reader = new BTreeReader(btree);
        this.writer = new BTreeWriter(btree);
    }

    async getRoot() { return this.reader.getRoot(); }
    async loadNode(ptr) { return this.reader.loadNode(ptr); }
    async saveNode(node) { return this.writer.saveNode(node); }
}

module.exports = NodeIO;