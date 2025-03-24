//B"H
var path = require("path");
var fs = require("fs").promises;
var awtsmoosJSON = require("./awtsmoosBinaryJSON/index.js")

class AwtsmoosDB {
  constructor(dbDir, {
    hashMapInitialCapacity = 8
  }={}) {
    this.dir=dbDir || "./awtsmoosDb"
    this.hashMapCapacity = hashMapInitialCapacity;
    this.hashEntrySize = 4;
  }

  async init() {
    await this.ensureDir();
    
  }



  async addHashToIndex(key) {
    var ind = await this.getFile(path.join(this.dir, "index.db"));
    if(!ind) {
      
    }
  }

  async getFile(fPath) {
    try {
      return fs.readFile(fPath);
    } catch(e) {

    }
  }




  async ensureDir() {
    if(!this.dir) return;
    try {
      await fs.mkdir(path.dirname(this.dir), {
        recursive: true
      })
    } catch(e){}
  }
}