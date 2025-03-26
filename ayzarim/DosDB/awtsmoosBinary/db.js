//B"H
var path = require("path");
var fs = require("fs").promises;

var serializeValue = require("./awtsmoosBinaryJSON/serialize/serializeValue.js");
var directlyParseValue = require("./awtsmoosBinaryJSON/parsing/direct.js")
var FileBuffer = require("./fileBuffer");
var AwtsmoosHashMap = require("./awtsmoosBinaryJSON/helpers/hashing/AwtsmoosHashMap.js")
var {
  ensureDir
}  = require("./helpers.js")
class AwtsmoosDB {
  constructor(dbDir, {
    hashMapInitialCapacity = 8
  }={}) {
    this.dir=dbDir || "./awtsmoosDb"
    this.hashMapCapacity = hashMapInitialCapacity;
    this.hashEntrySize = 4;

	this.ensureDir();
  }

  


  getHashEntry(key) {
	var hash = this.hashMap();
	var rawValue = hash.getValueAtKey(key);
	var parst = directlyParseValue(rawValue);
	
	//console.log("Raw",rawValue,rawValue+"")
	return parst;
  }

  addHashValueToIndex(key, value) {
	var hash = this.hashMap();
	var serialized = serializeValue(value);
	hash.setEntry(key, serialized);

  }


  hashMap() {
	var mainIndex = path.join(this.dir, "index.db");
	ensureDir(mainIndex);
	var buf = new FileBuffer(mainIndex);

	var firstShard = path.join(
		this.dir,
		"shard-0.db"
	);
	ensureDir(firstShard);
	var shardBuffer = new FileBuffer(firstShard);

	var hash = new AwtsmoosHashMap({
		buffer: buf,
		dataBuffer: shardBuffer
	});
	return hash;
  }

  async getFile(fPath) {
    try {
      return fs.readFile(fPath);
    } catch(e) {

    }
  }




  async ensureDir() {
    if(!this.dir) return;
    ensureDir(this.dir)
  }
}

module.exports = AwtsmoosDB