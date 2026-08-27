//B"H
var {
    hashKey
} = require("./misc.js");

var readConditional = require("../readConditional.js");
var writeConditional = require(
    "../writeConditional.js"
)


class AwtsmoosHashMap {
    constructor({
        capacity=16,
        hashEntrySize = 4,
        keySize = 4, /*
            each actual key is less 
            than 256 bytes
        */
        valueSize = 4,
        shardSize = 1024,
        buffer=null,
        dataBuffer = null
    }) {

        var hashTableBuffers = []
        const hashTableSize = capacity * 2;
        this.hashTableSize =hashTableSize;

        hashTableSize;

        var header = Buffer.alloc(1);
        header.writeUInt8(valueSize);

        this.valueSize = valueSize;
        this.keySize = keySize;
        this.hashEntrySize = hashEntrySize;

        this.hashMapBufferSize = 
            this.hashTableSize *  
            this.hashEntrySize


        if(!buffer) {
            buffer = Buffer.alloc(
                this.hashMapBufferSize
            );
        }

        if(!dataBuffer) {
            dataBuffer = Buffer.alloc(
                shardSize
            );
        }

        this.dataBuffer = dataBuffer;

        this.hashMapBuffer = buffer;
        this.isFileBuffer = this.hashMapBuffer
            .isFileBuffer
        
        this.dataOffset = 1;
    }

    

    setEntry(key, value) {
        var hashIndex = hashKey(key, this.hashTableSize);
        let index = hashIndex;
        var gotKey = this.getKeyAtIndex(index)
        
        while (
            gotKey+"" != key &&
            gotKey != 0

        ) {
            index = (index + 1) % this.hashTableSize;
            gotKey = this.getKeyAtIndex(index)
        }
        
        var valueBuf = Buffer.from(value);
        var keyBuf = Buffer.from(key);

        var entryBufs = [];

        
        var keyLengthBuf = writeConditional(
            keyBuf.length
        );

        entryBufs.push(keyLengthBuf.buffer);
     //   console.log("writing",keyLengthBuf,keyBuf.length)
        

        entryBufs.push(keyBuf);

        var valueLengthBuf = writeConditional(
            valueBuf.length
        );


        entryBufs.push(valueLengthBuf.buffer);
        
        entryBufs.push(valueBuf);

        var entry = Buffer.concat(entryBufs);
       // console.log("VALUE",valueLengthBuf,entry,entryBufs)

        var offset = index * 
            this.hashEntrySize
        
    
        var hashEntry = Buffer.alloc(
            this.hashEntrySize
        );

        var dataSize = this.dataBuffer.length;
        if(dataSize === 0) {
            dataSize = 1;
        }

        hashEntry.writeUInt32BE(
            dataSize //new place to append
        )

        if(this.isFileBuffer) {
            this.hashMapBuffer.writeBuffer(
                offset, hashEntry
            )
        } else {
            hashEntry.copy(this.hashMapBuffer, offset)
        }

        if(this.isFileBuffer) {
        //    console.log("Writing at offset",dataSize, entry, entry.length)
            this.dataBuffer.writeBuffer(
                dataSize, entry
            );
            var keyLength =
            readConditional(
                this.dataBuffer,
                dataSize
            ) 
            var read = this.dataBuffer.subarray(
                0,
                dataSize
            )
        //    console.log("red",read,keyLength)
        } else {
            entry.copy(this.dataBuffer, dataSize)
        }
      //  this.hashMapBuffer
    }

    getValueAtKey(key) {
        var hashIndex = hashKey(key, this.hashTableSize);
        let index = hashIndex;
        var gotKey = this.getKeyAtIndex(index)
        var str = (gotKey+"").trim()
     
        
      // return
        while (
            gotKey != 0 &&
            gotKey+"" != key
        ) {
            index = (index + 1) % this.hashTableSize;
            gotKey = this.getKeyAtIndex(index)
        }

        var got = this.getValueAtIndex(index)
       // console.log("Do it",key,index,gotKey, got, got+"")
        return got
    }

    getValueAtIndex(index) {
        var start = 
            this.hashEntrySize * index;

        var offsetInData = this.hashMapBuffer
            .readUInt32BE(
                start
            );
        if(offsetInData == 0) {
            return 0;
        }
        var keyLength =
            readConditional(
                this.dataBuffer,
                offsetInData
            ) //reading 
            // key length

        offsetInData = keyLength.offset;
        offsetInData += keyLength.amount /**
        SKIP the keey length actually
         */
     //   console.log("loaded",keyLength,offsetInData,this.dataBuffer.subarray(0, 12))
        var valueSize = 
            readConditional(
                this.dataBuffer,
                offsetInData
            );
            
        offsetInData = valueSize.offset;
        var res = this.dataBuffer.subarray(
            offsetInData 
            ,

            offsetInData 
           
            + valueSize.amount
        );

        return res;
    }
    getKeyAtIndex(index) {
        var start = 
            this.hashEntrySize * 
            index;
      

        var offsetInData = this.hashMapBuffer
            .readUInt32BE(
                start
            );
        if(offsetInData == 0) {
            
            
            return 0;
        }
      /*  console.log(
            "reading",

            "offset",
            offsetInData,index,start
        )*/
        var keyLength =
            readConditional(
                this.dataBuffer,
                offsetInData
            ) //reading 
            // key length
        var sub = this.dataBuffer.length

        //console.log("Hi",keyLength, index, start, sub)
        if(!keyLength.amount)
            return 0;

        var newOffset = keyLength.offset - offsetInData
        var res = this.dataBuffer.subarray(
            offsetInData + 
            newOffset,

            offsetInData + 
            newOffset + keyLength.amount
        );
        return res;
        /*
        var bufs = [];
        var offset = 0;
        var i;
        for(
            i = 0;
            i < keyLength;
            i++
        ) {
            var byte = this.dataBuffer.readUint8(
                offset
            )
            offset++;
            bufs.push(byte);
        }
        return Buffer.concat(bufs);*/
    }

}

module.exports = AwtsmoosHashMap;