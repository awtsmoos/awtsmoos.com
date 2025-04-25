//B"H
var OffsetBuffer = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/offsetBuffer.js")

// Imagine a Buffer, like the world G-d did make,
const mainBuffer = Buffer.from([0x00, 0x01, 0x02, 0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78]);
// 10 bytes, a small vessel, for goodness' sake.

// Now, a focused view, a Mitzvah we undertake,
// Starting at byte 3, no room for mistake.
const offsetView = new OffsetBuffer(mainBuffer, 3);

// What is its length? The potential revealed,
console.log("OffsetView Length:", offsetView.length); // Output: 7 (10 total - 3 offset)

// Read UInt8 at offset 0 (relative to offsetView), what light is unsealed?
console.log("Read UInt8 at 0:", offsetView.readUInt8(0).toString(16)); // Output: ab (Reads from mainBuffer[3])

// Read UInt16BE at offset 1 (relative to offsetView), Chochmah concealed?
console.log("Read UInt16BE at 1:", offsetView.readUInt16BE(1).toString(16)); // Output: cdef (Reads from mainBuffer[4] and mainBuffer[5])

// Access via index, like finding a spark in the field,
console.log("Access index 2:", offsetView[2].toString(16)); // Output: ef (Accesses mainBuffer[3+2] = mainBuffer[5])

// Try writing a byte, let goodness be wielded,
offsetView.writeUInt8(0x99, 4); // Write 0x99 at offsetView's offset 4 (mainBuffer[7])
console.log("Main buffer after write:", mainBuffer); // Output: <Buffer 00 01 02 ab cd ef 12 99 56 78>

// Set via index, another good deed revealed,
offsetView[5] = 0xBB; // Set offsetView's index 5 (mainBuffer[8]) to 0xBB
console.log("Main buffer after index set:", mainBuffer); // Output: <Buffer 00 01 02 ab cd ef 12 99 bb 78>

// Get a slice, a smaller domain,
const sliceOfView = offsetView.slice(1, 4); // Slice from index 1 up to (not including) 4 of offsetView
console.log("Slice Length:", sliceOfView.length); // Output: 3
console.log("Slice content [0]:", sliceOfView[0].toString(16)); // Output: cd (Points to mainBuffer[3+1] = mainBuffer[4])
console.log("Slice content [1]:", sliceOfView[1].toString(16)); // Output: ef (Points to mainBuffer[3+2] = mainBuffer[5])
console.log("Slice content [2]:", sliceOfView[2].toString(16)); // Output: 12 (Points to mainBuffer[3+3] = mainBuffer[6])
console.log("Slice toString:", sliceOfView.toString('hex')); // Output: cdef12

// Convert offset view to string
console.log("OffsetView toString (hex):", offsetView.toString('hex')); // Output: abcdef1299bb78

// Test bounds
try {
    offsetView.readUInt8(7); // Tries to read at mainBuffer[3+7] = mainBuffer[10] (out of bounds)
} catch (e) {
    console.error("Caught expected error:", e.message);
}

try {
    console.log("Access index 7:", offsetView[7]); // Access mainBuffer[3+7] = mainBuffer[10]
} catch (e) {
    console.error("Caught expected error on index access:", e.message); // Proxy returns undefined here, no error
}
console.log("Access index 6:", offsetView[6].toString(16)); // Accesses mainBuffer[3+6] = mainBuffer[9] -> 78
console.log("Access index 7 (should be undefined):", offsetView[7]); // Accesses mainBuffer[3+7] = mainBuffer[10] -> undefined


const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
const off1 = new OffsetBuffer(buf1, 2); // Represents [3, 4, 5, 6, 7, 8]
const off2 = new OffsetBuffer(buf1, 2); // Represents [3, 4, 5, 6, 7, 8]
const buf2 = Buffer.from([3, 4, 5, 6, 7, 8]);
const buf3 = Buffer.from([3, 4, 0, 6, 7, 8]);
const off3 = new OffsetBuffer(buf3, 0); // Represents [3, 4, 0, 6, 7, 8]


console.log("off1 equals off2:", off1.equals(off2)); // true
console.log("off1 equals buf2:", off1.equals(buf2)); // true
console.log("off1 equals off3:", off1.equals(off3)); // false
console.log("off1 compare off2:", off1.compare(off2)); // 0
console.log("off1 compare buf2:", off1.compare(buf2)); // 0
console.log("off1 compare off3:", off1.compare(off3)); // 1 (5 > 0 at index 2)
console.log("off3 compare off1:", off3.compare(off1)); // -1 (0 < 5 at index 2)