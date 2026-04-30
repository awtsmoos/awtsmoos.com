
// B"H
/**
 * @file SerializationTypeMap.js
 * @description
 * To exist in Firebase's JSON tree, all entities must shed their complex forms (Buffers, Dates, Functions)
 * and wear the simple garment of standard JSON strings and objects.
 * We avoid 'switch' by mapping type-checking functions directly to their serializers.
 */

const TypeMapToFirebase = [
    {
        check: (val) => Buffer.isBuffer(val),
        transform: (val) => ({
            _awtsmoosType: "buffer",
            _awtsmoosBinary: val.toString("base64"),
            _awtsmoosLength: val.length
        })
    },
    {
        check: (val) => val instanceof Date,
        transform: (val) => ({
            _awtsmoosType: "date",
            _awtsmoosValue: val.toISOString()
        })
    },
    {
        check: (val) => typeof val === "function",
        transform: (val) => ({
            _awtsmoosType: "function",
            _awtsmoosValue: val.toString()
        })
    }
];

const TypeMapFromFirebase = [
    {
        check: (val) => val && val._awtsmoosType === "buffer" && val._awtsmoosBinary,
        transform: (val) => Buffer.from(val._awtsmoosBinary, "base64")
    },
    {
        check: (val) => val && val._awtsmoosType === "date" && val._awtsmoosValue,
        transform: (val) => new Date(val._awtsmoosValue)
    },
    {
        check: (val) => val && val._awtsmoosType === "function" && val._awtsmoosValue,
        transform: (val) => {
            try {
                // Return string representation if eval is unsafe, but typically DosDB evaluates it back
                return eval(`(${val._awtsmoosValue})`);
            } catch (e) {
                return val._awtsmoosValue;
            }
        }
    }
];

module.exports = {
    TypeMapToFirebase,
    TypeMapFromFirebase
};
