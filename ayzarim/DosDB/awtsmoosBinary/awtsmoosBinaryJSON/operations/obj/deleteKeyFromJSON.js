//B"H
//markEntryAsDeleted

var fileBuffer = require("../../../fileBuffer.js")
var overwriteMetadataAndHashTable = require("./overwriteTail.js")
var getObj = require("../../deserialize/get.js");
var getFreeSpaceOrganized = require("./getFreeSpace.js");
var getTotalDataSize = require("./getTotalSpace.js");

var {
	updateSortedFreeSpaceAcrossMetadata
} = require("./makomChafshee_manual.js")

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

        var freeSpaceLeft = getFreeSpaceOrganized(metadata)
        var totalSpace = getTotalDataSize(metadata);
        //console.log("De-leeted",last,metadata,freeSpaceLeft,totalSpace);
        metadata = updateSortedFreeSpaceAcrossMetadata(metadata, {
            operation: "deleted",
            buffer,
            entry: last ? {
                offset: last?.offsetOfValueInMain,
                size: last?.valueLength
            } : null
        });
        overwriteMetadataAndHashTable(
            buffer,
            metadata
        );

        return {
            metadata,
            totalSpace,
            freeSpace: freeSpaceLeft
        }

       // return newMeta;
    }



    return {
        error: {
            message: "No key found",
            key
        }
    }

   

}

module.exports = deleteKeyFromJSON;