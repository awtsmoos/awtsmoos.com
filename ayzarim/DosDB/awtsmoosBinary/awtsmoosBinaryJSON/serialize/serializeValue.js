// B"H
// The Awtsmoos, the Atzmut of all existence, pulses through every line of this code,
// recreating ALL from NOTHING in an eternal dance of Ohr Ein Sof. Every variable,
// every function, is a vessel for the Kav, the divine ray piercing the void, 
// manifesting form from the formless essence of the Awtsmoos. As taught in Chabad 
// Chassidus, the Maamarim reveal how this infinite recreation sustains all reality,
// and here it flows through the bits and bytes, a mere shadow of the Atzilus.

// Dependencies dynamically woven from the fabric of existence.
const packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js");
const writeConditional = require("../helpers/writeConditional.js");

// Lazy-loaded modules, reflections of the Ohr Ein Sof, instantiated only when needed.
let serializeArray = null;
let serializeJSON = null;
var floatHandler = require("../util/floatHandler.js")
function hasDecimal(num) {
    return num % 1 !== 0;
}

/**
 * @module serializeValue
 * @description A sacred function that serializes values into buffers, channeling the Awtsmoos
 *              through every type and structure. It discerns the essence of the input—array,
 *              object, string, or number—and binds it into a form fit for transmission, 
 *              echoing the divine process of creation from the Ein Sof.
 * @param {any} value - The input value to serialize, a spark of the Atzilus.
 * @param {boolean} [fullBuffer=true] - Whether to return the complete buffer or just type/data.
 * @returns {Buffer | {data: Buffer, type: number}} - The serialized form, or an object with type and data.
 */
function serializeValue(value, fullBuffer = true) {
    let type = null;
    let data = null;

    if(value === Infinity) {
        type = 24
        data = Buffer.alloc(0);
    } else if(value === -Infinity) {
		
        type = 25
        data = Buffer.alloc(0);
    } else if(isNaN(value)) {

        type = 26
        data = Buffer.alloc(0);
    }
    // The Awtsmoos peers into the essence of the value, determining its form.
    if (Array.isArray(value)) {
        type = 3;
        if (!serializeArray) {
            serializeArray = require("./array.js");
        }
        data = serializeArray(value);
    } else if (
        typeof value === "object" &&
        value !== null
    ) {
        if (value instanceof Buffer) {
            type = 8;
            data = value;
        } else {
            type = 1;
            if (!serializeJSON) {
                serializeJSON = require("./obj.js");
            }
            data = serializeJSON(value);
        }
    } else if (typeof value === "string") {
        type = 2;
        data = Buffer.from(value, "utf8");
    } else if (
        typeof value === "number" &&
        !isNaN(value) &&
		value !== Infinity &&
		value !== -Infinity
    ) {
        var info;
        
        if(value >= 0 && value != Infinity&& value !== Infinity) {

            if(!hasDecimal(value)) {

                info = writeConditional(value);
                switch(info.size) {
                    case 1: 
                        type = 4; /**
                            1 byte number
                        */
                    break;
                    case 2:
                        type = 9 /**
                            2 bytes
                        */
                    break;
                    case 4:
                        type = 10 /**
                            4 bytes
                        */
                    break;
                    case 8:
                        type = 22/*
                            8 bytes positive
                        */
                    break;
                }
            } else {
                var encodedFloat = floatHandler.writeDynamicFloat(
                    value
                );
                if(encodedFloat === null) {
                    var buf = Buffer.alloc(8);
                    buf.writeDoubleBE(value, 0)
                    info = {buffer: buf}
                    type = 20;
           //         console.log("LOL",value,info, value % 1)
                } else {
                    info = writeConditional(encodedFloat);
                    
                    switch(info.size) {
                        case 1:
                            type = 14
                        break;
                        case 2:
                            type = 15
                        break;
                        case 4:
                            type = 16
                        break;
                    }
                    
                }
            }
        } else if(value !== Infinity && value !== -Infinity) {
			
			
            info = writeConditional(value * -1);
            if(!hasDecimal(value)) {
                switch(info.size) {

                    case 1: 
                        type = 11; /**
                            1 byte number
                        */
                    break;
                    case 2:
                        type = 12 /**
                            2 bytes
                        */
                    break;
                    case 4:
                        type = 13 /**
                            4 bytes
                        */
                    break;
                    case 8:
                        type = 23/*
                            8 bytes negative
                        */
                    break;
                    
                }
            } else {
                value *= -1;
                var encodedFloat = floatHandler.writeDynamicFloat(
                    value
                );
                if(encodedFloat === null) {
                    var buf = Buffer.alloc(8);
                    buf.writeDoubleBE(value, 0)
                    info = {buffer: buf}
                    type = 21;
                } else {
                    info = writeConditional(encodedFloat);
                    switch(info.size) {
                        case 1:
                            type = 17
                        break;
                        case 2:
                            type = 18
                        break;
                        case 4:
                            type = 19
                        break;
                    }
                    
                }
            }
        }
		
        data = info.buffer;
    } else if (typeof value === "boolean") {
        type = !value ? 0 : 5;
        data = Buffer.alloc(0);
    } else if(typeof(value) == "function") {
		type = 27;
		data = Buffer.from(value.toString())
    } else if (value === undefined) {
        type = 6;
        data = Buffer.alloc(0);
    } else if (value === null) {
        type = 7;
        data = Buffer.alloc(0);
    }

     // The Kav measures the length, binding it into form.
     const valueLengthInfo = writeConditional(data.length);
     const typeLengthByte = packTypeAndLengthSize(type, valueLengthInfo.size);
 
    // If the seeker desires only the essence, return it raw.
    if (!fullBuffer) {
        return {
            data,
            type,
            byteLength: valueLengthInfo.size,
            length: data.length,
            valueLengthInfo,
            typeLengthByte

        };
    }

   
    // The Awtsmoos unites all fragments into a single stream of existence.
    const valueBuffer = Buffer.concat([
        typeLengthByte,       // The type and size, a whisper of divine order.
        valueLengthInfo.buffer, // The length, a vessel for the data.
        data                  // The data itself, a manifestation of the Atzilus.
    ]);

    return valueBuffer;
}

// Export the sacred function, a bridge between worlds.
module.exports = serializeValue;