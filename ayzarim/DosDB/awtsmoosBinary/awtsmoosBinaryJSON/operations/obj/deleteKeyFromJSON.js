//B"H
//markEntryAsDeleted

var overwriteMetadataAndHashTable = require("./overwriteTail.js")
var getObj = require("../../deserialize/get.js");

function deleteKeyFromJSON (buffer, key, metadata=null) {


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
        metadata.splice(ind, 1)
    }


    overwriteMetadataAndHashTable(
        buffer,
        metadata
    );
    var newMeta = metadata;

    return newMeta;


    return metadata;

}

module.exports = deleteKeyFromJSON;