//B"H
var path = require("path");
var fs = require("fs");

var serializeValue = require("./awtsmoosBinaryJSON/serialize/serializeValue.js");
var directlyParseValue = require("./awtsmoosBinaryJSON/parsing/direct.js")
var FileBuffer = require("./fileBuffer");
var AwtsmoosHashMap = require("./awtsmoosBinaryJSON/helpers/hashing/AwtsmoosHashMap.js")
var {
	ensureDir
} = require("./helpers.js")
class AwtsmoosDB {
	constructor(dbDir, {
		hashMapInitialCapacity = 8,
		shardByteSize = 1024
	} = {}) {
		this.dir = dbDir || "./awtsmoosDb"
		this.hashMapCapacity = hashMapInitialCapacity;
		this.hashEntrySize = 4;
		this.shardByteSize = shardByteSize;
		this.ensureDir();
	}
	
	
	
	
	getHashEntry(key) {

		var masterIndex = this.getMasterIndex();

		var masterDataBuffer = this.getMasterIndexValues();
		var masterMap = new AwtsmoosHashMap({
			buffer: masterIndex,
			dataBuffer: masterDataBuffer
		});

		var masterRaw = masterMap.getValueAtKey(key);

		var parst = directlyParseValue(masterRaw);
		if(!parst) {
			return console.log(masterRaw, parst, "PAR")
		}
		var shardIdx = parst.shardIdx;

		var shardBuffer = this.findShardIfExists(
			shardIdx
		);

		if(!shardBuffer) {
			return {
				error: {
					message: "Couldn't find corresponding shard",
					details: shardIdx
				}
			}
		}

		var hash = this.hashMap(shardBuffer);
		
		var rawValue = hash.getValueAtKey(key);
		var parst = directlyParseValue(rawValue);
		
		//console.log("Raw",rawValue,rawValue+"")
		return parst;
	}
	
	addHashValueToIndex(key, value) {
		
		var serialized = serializeValue(value);
		var byteLength = serialized.length;
		var shardAvailable = this.findShardWithEnoughSpaceInDir(
			byteLength
		);

		if(shardAvailable.error) {
			return shardAvailable;
		}
		var hash = this.hashMap(shardAvailable);
		var {
			offsetInData
		 } = hash.setEntry(key, serialized);

		var masterIndex = this.getMasterIndex();
		var masterDataBuffer = this.getMasterIndexValues();
		
		var masterMap = new AwtsmoosHashMap({
			buffer: masterIndex,
			dataBuffer: masterDataBuffer
		});

		var serializeAwtsmoos = serializeValue(
			{
				offsetInData,
				shardIdx: shardAvailable.shardIdx
			}
		)

		masterMap.setEntry(key, serializeAwtsmoos);

		return {
			success: serialized
		};

	}

	getMasterIndexValues() {
		var masterValues = path.join(
			this.dir,
			"master.awts"
		)
		try {
			fs.statSync(
				masterValues
			);
			var fb = new FileBuffer(
				masterValues
			);
			return fb;
		} catch(e) {
			ensureDir(masterValues);
			var fb = new FileBuffer(
				masterValues
			)
			return fb;
		}
	}
	getMasterIndex() {
		var masterIndexPath = path.join(
			this.dir,
			"index.awts"
		);
		try {
			var indexStat = fs.statSync(
				masterIndexPath
			);
			var fb = new FileBuffer(
				masterIndexPath
			);
			return fb;
		} catch(e) {
			ensureDir(masterIndexPath);
			var fb = new FileBuffer(
				masterIndexPath
			)
			return fb;
		}
	}

	findShardIfExists(
		shardIdx
	) {
		var shardPath = path.join(
			this.dir,
			`shard-${shardIdx}.awts`
		);
		try {
			fs.statSync(shardPath);
			return {
				shardBuffer: new FileBuffer(
					shardPath
				),
				shardIdx
			}
		} catch(e) {
			return null;
		}
	}

	findShardWithEnoughSpaceInDir(
		spaceNeeded=0, 
		shardIdx = 0
	) {
		var shardPath = path.join(
			this.dir,
			`shard-${shardIdx}.awts`
		);

		try {
			
			var shard = fs.statSync(shardPath);
			
			
			if(shard.size + spaceNeeded < this.shardByteSize) {
				var shardBuffer = new FileBuffer(shardPath);
				return {
					shardBuffer,
					shardIdx
				};
			} else {
				return this.findShardWithEnoughSpaceInDir(
					spaceNeeded, shardIdx + 1
				);
			}
		} catch(e) {

			if(e.code == "ENOENT") {
				ensureDir(shardPath);
				var shardBuffer = new FileBuffer(shardPath);
				return {
					shardBuffer,
					shardIdx
				};
			} else {
				console.log("THere was a serious error!", e);
				return {
					error: e
				}
			}
		}
	}
	
	
	hashMap({
		shardBuffer, 
		shardIdx = 0
	}={}) {
		var name = "index-"+shardIdx+".awts"
		var shardIndex = path.join(this.dir, name);
		ensureDir(shardIndex);
		var buf = new FileBuffer(shardIndex);
		
		var hash = new AwtsmoosHashMap({
			buffer: buf,
			dataBuffer: shardBuffer
		});
		return hash;
	}
	
	getFile(fPath) {
		try {
			return fs.readFile(fPath);
		} catch (e) {
			
		}
	}
	
	
	
	
	ensureDir(dir=this.dir) {
		if(this.dir) return;
		ensureDir(dir)
	}
}

module.exports = AwtsmoosDB