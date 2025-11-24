//B"H

function getTotalDataSize(metadata) {
	var leastOffset = null;
	var greatestOffset = 0;
	var totalSize = 0;
	metadata.forEach(q => {
		if(
			q.offsetOfValueInMain < leastOffset ||
			leastOffset === null
		) {
			leastOffset = q.offsetOfValueInMain
		}

		if(q.offsetOfValueInMain > greatestOffset) {
			greatestOffset = q.offsetOfValueInMain 

			totalSize = (
				greatestOffset + 
				q.valueLength
			) - leastOffset;
		}
	});
	return totalSize;
}


module.exports=getTotalDataSize;