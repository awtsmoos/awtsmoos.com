//B"H
/*
    free space manager
*/


/**
 * 
 * @param {Array} metadata array or 
 * reference to metadata array of obj 
 * @param {*} newFreeSpaceList Array of the
 * entire updated free space list
 * @param {*} options (IF deleted a key, entry is 
 *  the last entry we deleted from last list,
 * which now makes that the new free space
 * to insert in the sorted list.
 * 
 * IF "operation" is "added", then 
 * we took away "entry" from previous list.
 * )
 * @returns 
 */
function updateSortedFreeSpaceAcrossMetadata(
    metadata, 
    newFreeSpaceList,
    options = {
        entry = {
            offset= 0,
            size= 0
        }={},
        operation: "deleted"
    } = {}
) {
	if(!Array.isArray(metadata) || !metadata.length) {
		return metadata;
	}
	if(!Array.isArray(newFreeSpaceList)) {
		return metadata;
	}
    var entry = options?.entry;
    /*
        if the last entry that was deleted
        (and is now free space) was provided,
        then attempt to modify the 
        metadata object without rewriting 
        everything.
    */
	if(entry) {
		var {
			offset,
			size
		} = entry;
		var slotThatsJustBarelySmaller = null;
		var slot;
		var lastSize = 0;
		for(slot of metadata) {
			var freeSpaceLength = slot?.freeSpaceLength;
			if(!freeSpaceLength) {
				continue;
			}
			if(freeSpaceLength < size) {
				lastSize = size;
				continue;
			} else {
				if(lastSize) {
					slotThatsJustBarelySmaller = slot;
					break;
				}
			}
		}

		if(!slotThatsJustBarelySmaller) {
			metadata[0].freeSpaceOffset = offset;
			metadata[0].freeSpaceLength = size;
			return metadata;
		}
	}
	newFreeSpaceList.forEach(newFreeSpaceEntry => {

		var freeSpaceOffset = newFreeSpaceEntry.offset;
		var freeSpaceSize = newFreeSpaceEntry.length;
		
	});
}

module.exports = {
    updateSortedFreeSpaceAcrossMetadata
};