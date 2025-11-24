//B"H

//FILE serialize/array.js

var writeConditional = require("../helpers/writeConditional.js")
var writeToBuffer = require("../helpers/writeToBuffer.js")

var {
    
    magicArray

} = require("./../constants.js");

var {
    typesWith0Length
} = require("../parsing/typeInfo.js")
var serializeValue = require("./serializeValue.js")

var temp = {};



var serializeJSON = null;
Object.defineProperty(temp, "serializeJSON", {
    get() {
        if (!serializeJSON) serializeJSON = require("./obj.js");
        return serializeJSON;
    }
});
var {
	packedLength,
	unpackLength
} = require("../packing/packedLength.js")
var packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js")


/**
 * @method serializeArray
 * @description Serializes an array into a binary form, index at the end, echoing the Awtsmoos’ hidden order.
 * @param {Array} arr - The array to serialize
 * @returns {Buffer} - The serialized binary buffer
 */
function serializeArray(arr) {
    // Begin with the signature of the Awtsmoos
    let header = [
        Buffer.from(magicArray)
    ];

    // Encode array length, a finite boundary within the infinite
    const lengthInfo = writeConditional(arr.length);
    const arrayLengthSize = lengthInfo.size; // Bytes for array length (1, 2, 4, 8)

    //firs tthing is knowing the size of 
    // the size of our array

    // Placeholder for offset size (updated later)
    const offsetSizePlaceholder = Buffer.alloc(1); //lets us read sizes better later

    
    



    header.push(offsetSizePlaceholder);
    const dataBuffers = [];
    const offsets = []; // Store offsets for index table

    // Manifest each item, a Sefirah unfolding from the Ein Sof
    let currentOffset = header.reduce((sum, buf) => sum + buf.length, 0);
   
    
    for (let item of arr) {
        let itemBuffer;
        
       

        let {
            type, data
        } = serializeValue(item, false) /**
         * return format: buffer with
            first byte: type of entry (6 LSB)
            and size of its length (2 MSB, where 0 = 0, 1 2, 2 4, 3 8), 

            needs to be unpacked in deserialization
         */

        const lengthInfo = writeConditional(data.length);
        
        const lengthSize = lengthInfo.size;
        const typeLengthByte = packTypeAndLengthSize(type, lengthSize);
        if(typeLengthByte === null) {
            console.log("ISSUE!",type, lengthSize)
            return null
        }
        var ar = [
            Buffer.from([typeLengthByte]),
            typesWith0Length.includes(type) ?
            Buffer.alloc(0) : lengthInfo.buffer,
            data
        ]
      
        
        
        itemBuffer = Buffer.concat(ar);

        offsets.push(currentOffset);
        dataBuffers.push(itemBuffer);
        currentOffset += itemBuffer.length;
    }

    // Determine offset size based on total data length
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const offsetSize = dataLength < 256 ? 1 : 
        dataLength < 65536 ? 2 : 
        dataLength < 4294967296 ? 4 : 8;

    
    

    
    
    var packedArrayLengthSize = packedLength(arrayLengthSize) /*
        0 - 3 indicating bytes 1 2 4 8
    */

       // console.log("Ar length",lengthInfo)
   var packedOffsetSize = packedLength(offsetSize);

	var packedByte = (
		(
			(
				0b00001111
			) & (
				(packedArrayLengthSize << 2) |
                //0b00001100
				packedOffsetSize
                //0b00000011
			)
		)
	);

   
	offsetSizePlaceholder.writeUInt8(
		packedByte
		//offsetSize
	);

	

    var footer = [];
    
    // Build index table at the end, a map of divine order
    const indexTable = Buffer.alloc(arr.length * offsetSize);
    offsets.forEach((offset, i) => {
        writeToBuffer(indexTable, offset, offsetSize, i * offsetSize);
    });

    footer.push(indexTable);
    /**
     * now length of arrat itself, dynamic size
     * put length at 
     * very end so we can read it later
     * and use it to determine size of
     * indexTable
     */
    footer.push(lengthInfo.buffer);
    // Unite all in the light of the Awtsmoos
    
    return Buffer.concat([
        Buffer.concat(header),
        Buffer.concat(dataBuffers),
        Buffer.concat(footer)
    ]);
}

module.exports = serializeArray;