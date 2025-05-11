//B"H
//markEntryAsDeleted

var fileBuffer = require("../../../fileBuffer.js")
var overwriteMetadataAndHashTable = require("./overwriteTail.js")
var getObj = require("../../deserialize/get.js");
var getFreeSpaceOrganized = require("./getFreeSpace.js");
var getTotalDataSize = require("./getTotalSpace.js");
function deleteKeyFromJSON (buffer, key, metadata=null) {
    if(typeof(buffer) == "string") {
		buffer = new fileBuffer(buffer)
	} 

    if(!metadata) {

        metadata = 
            getObj.getMetadata(
                buffer
            )
    }
    var ind = -1;
    metadata.forEach((q,i) => {
        if(q.key == key) {
            ind = i;
        }
        
    })

    if(ind > -1) {
        var last = metadata[ind];
        //console.log("De-leeted",last);
        metadata.splice(ind, 1)

        overwriteMetadataAndHashTable(
            buffer,
            metadata
        );
        var newMeta = metadata;

        return newMeta;
    }



    var freeSpaceLeft = getFreeSpaceOrganized(metadata)
    var totalSpace = getTotalDataSize(metadata);

    return {
        metadata,
        totalSpace,
        freeSpace: freeSpaceLeft
    }

}

module.exports = deleteKeyFromJSON;