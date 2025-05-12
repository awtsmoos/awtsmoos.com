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

    var last;
    if(ind > -1) {
        last = metadata[ind];
       
        metadata.splice(ind, 1)

        overwriteMetadataAndHashTable(
            buffer,
            metadata
        );
        var newMeta = metadata;

       // return newMeta;
    }



    var freeSpaceLeft = getFreeSpaceOrganized(metadata)
    var totalSpace = getTotalDataSize(metadata);
    console.log("De-leeted",last,metadata,freeSpaceLeft,totalSpace);
    return {
        metadata,
        totalSpace,
        freeSpace: freeSpaceLeft
    }

}

module.exports = deleteKeyFromJSON;