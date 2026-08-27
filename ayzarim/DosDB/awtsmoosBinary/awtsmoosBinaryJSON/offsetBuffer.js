//B"H


// Get the original Buffer class
const OriginalBuffer = Buffer;

class OffsetBuffer {
    /**
     * The underlying source Buffer (the ultimate original Buffer).
     * @private
     * @type {Buffer}
     */
    _sourceBuffer;

    /**
     * The starting offset within the _sourceBuffer for this view.
     * @private
     * @type {number}
     */
    _sourceOffset;

    /**
     * The length of this view.
     * @private
     * @type {number}
     */
    _length;

    /**
     * Creates an instance of OffsetBuffer.
     * Acts as a view into a portion of a source Buffer or another OffsetBuffer.
     *
     * @param {Buffer | OffsetBuffer} source The source Buffer or OffsetBuffer.
     * @param {number} [offset=0] The starting offset within the source where this view begins.
     * @param {number} [length] The length of this view. Defaults to the remaining length of the source from the offset.
     * @throws {TypeError} If source is not a Buffer or OffsetBuffer.
     * @throws {RangeError} If offset or length are invalid or out of bounds.
     */
    constructor(source, offset = 0, length) {
        if (typeof offset !== 'number' || !Number.isInteger(offset) || offset < 0) {
            throw new RangeError(`Offset must be a non-negative integer, received ${offset}`);
        }

        let effectiveSourceLength;

        if (source instanceof OffsetBuffer) {
            // Source is another OffsetBuffer, adjust offset and use its ultimate source
            this._sourceBuffer = source._sourceBuffer; // Get the original underlying Buffer
            this._sourceOffset = source._sourceOffset + offset; // Add the new offset to the existing one
            effectiveSourceLength = source.length; // Bounds checking is relative to the source *OffsetBuffer*
        } else if (
            source instanceof OriginalBuffer ||
            source.constructor.name == "FileBuffer"
        ) {
            // Source is a standard Buffer
            this._sourceBuffer = source;
            this._sourceOffset = offset;
            effectiveSourceLength = source.length; // Bounds checking is relative to the source *Buffer*
        } else {
            throw new TypeError('Source must be a Buffer or an OffsetBuffer instance.');
        }

        // Validate offset against the effective source length
        if (offset > effectiveSourceLength) {
             throw new RangeError(`Offset (${offset}) is out of bounds for source length (${effectiveSourceLength})`);
        }

        // Determine and validate length
        if (length === undefined) {
            this._length = effectiveSourceLength - offset;
        } else {
             if (typeof length !== 'number' || !Number.isInteger(length) || length < 0) {
                throw new RangeError(`Length must be a non-negative integer, received ${length}`);
            }
            if (offset + length > effectiveSourceLength) {
                throw new RangeError(`Requested range (offset ${offset} + length ${length}) exceeds source length (${effectiveSourceLength})`);
            }
            this._length = length;
        }

         // Final check on calculated absolute offset and length against the *ultimate* source buffer
        if (this._sourceOffset < 0 || this._sourceOffset + this._length > this._sourceBuffer.length) {
             throw new RangeError(`Internal calculation resulted in invalid range [${this._sourceOffset}, ${this._sourceOffset + this._length}) for the underlying buffer of length ${this._sourceBuffer.length}`);
        }

        // Make properties non-writable after construction (optional but good practice)
        Object.defineProperties(this, {
            _sourceBuffer: { writable: false },
            _sourceOffset: { writable: false },
            _length: { writable: false },
        });
    }

    // --- Core Properties ---

    /**
     * Gets the length (in bytes) of this OffsetBuffer view.
     * @returns {number}
     */
    get length() {
        return this._length;
    }

    /**
     * Gets the original underlying Buffer object.
     * @returns {Buffer}
     */
    get sourceBuffer() {
        return this._sourceBuffer;
    }

    /**
     * Gets the starting offset of this view within the original underlying Buffer.
     * @returns {number}
     */
    get sourceOffset() {
        return this._sourceOffset;
    }

    // --- Helper for bounds checking ---
    /**
     * @private
     * @param {number} offset Offset relative to this OffsetBuffer.
     * @param {number} [byteLength=1] Length of data to access.
     * @param {string} [methodName='operation'] Name of the calling method for error messages.
     * @throws {RangeError} If access is out of bounds.
     */
    _checkBounds(offset, byteLength = 1, methodName = 'operation') {
        if (typeof offset !== 'number' || !Number.isInteger(offset)) {
             throw new RangeError(`Offset must be an integer for ${methodName}, received ${offset}`);
        }
         if (offset < 0 || offset + byteLength > this._length) {
            throw new RangeError(`Offset ${offset} + length ${byteLength} is out of bounds for OffsetBuffer of length ${this._length} in ${methodName}`);
        }
    }

    /**
     * @private
     * @param {number} relativeOffset Offset relative to this OffsetBuffer.
     * @returns {number} Absolute offset in the underlying source buffer.
     */
    _getAbsoluteOffset(relativeOffset) {
        return this._sourceOffset + relativeOffset;
    }

    // --- Buffer Read Methods ---

    readUInt8(offset = 0) {
        this._checkBounds(offset, 1, 'readUInt8');
        return this._sourceBuffer.readUInt8(this._getAbsoluteOffset(offset));
    }

    readInt8(offset = 0) {
        this._checkBounds(offset, 1, 'readInt8');
        return this._sourceBuffer.readInt8(this._getAbsoluteOffset(offset));
    }

    // Implementations for BE (Big Endian)
    readUInt16BE(offset = 0) {
        this._checkBounds(offset, 2, 'readUInt16BE');
        return this._sourceBuffer.readUInt16BE(this._getAbsoluteOffset(offset));
    }
    readUInt32BE(offset = 0) {
        this._checkBounds(offset, 4, 'readUInt32BE');
        return this._sourceBuffer.readUInt32BE(this._getAbsoluteOffset(offset));
    }
    readInt16BE(offset = 0) {
        this._checkBounds(offset, 2, 'readInt16BE');
        return this._sourceBuffer.readInt16BE(this._getAbsoluteOffset(offset));
    }
    readInt32BE(offset = 0) {
        this._checkBounds(offset, 4, 'readInt32BE');
        return this._sourceBuffer.readInt32BE(this._getAbsoluteOffset(offset));
    }
    readFloatBE(offset = 0) {
        this._checkBounds(offset, 4, 'readFloatBE');
        return this._sourceBuffer.readFloatBE(this._getAbsoluteOffset(offset));
    }
    readDoubleBE(offset = 0) {
        this._checkBounds(offset, 8, 'readDoubleBE');
        return this._sourceBuffer.readDoubleBE(this._getAbsoluteOffset(offset));
    }
    readBigUInt64BE(offset = 0) {
        this._checkBounds(offset, 8, 'readBigUInt64BE');
        return this._sourceBuffer.readBigUInt64BE(this._getAbsoluteOffset(offset));
    }
    readBigInt64BE(offset = 0) {
        this._checkBounds(offset, 8, 'readBigInt64BE');
        return this._sourceBuffer.readBigInt64BE(this._getAbsoluteOffset(offset));
    }

    // Implementations for LE (Little Endian)
    readUInt16LE(offset = 0) {
        this._checkBounds(offset, 2, 'readUInt16LE');
        return this._sourceBuffer.readUInt16LE(this._getAbsoluteOffset(offset));
    }
    readUInt32LE(offset = 0) {
        this._checkBounds(offset, 4, 'readUInt32LE');
        return this._sourceBuffer.readUInt32LE(this._getAbsoluteOffset(offset));
    }
    readInt16LE(offset = 0) {
        this._checkBounds(offset, 2, 'readInt16LE');
        return this._sourceBuffer.readInt16LE(this._getAbsoluteOffset(offset));
    }
    readInt32LE(offset = 0) {
        this._checkBounds(offset, 4, 'readInt32LE');
        return this._sourceBuffer.readInt32LE(this._getAbsoluteOffset(offset));
    }
    readFloatLE(offset = 0) {
        this._checkBounds(offset, 4, 'readFloatLE');
        return this._sourceBuffer.readFloatLE(this._getAbsoluteOffset(offset));
    }
    readDoubleLE(offset = 0) {
        this._checkBounds(offset, 8, 'readDoubleLE');
        return this._sourceBuffer.readDoubleLE(this._getAbsoluteOffset(offset));
    }
    readBigUInt64LE(offset = 0) {
        this._checkBounds(offset, 8, 'readBigUInt64LE');
        return this._sourceBuffer.readBigUInt64LE(this._getAbsoluteOffset(offset));
    }
    readBigInt64LE(offset = 0) {
        this._checkBounds(offset, 8, 'readBigInt64LE');
        return this._sourceBuffer.readBigInt64LE(this._getAbsoluteOffset(offset));
    }

    /**
     * Reads `byteLength` number of bytes from the buffer at the specified `offset`
     * and interprets the result as a big-endian unsigned integer supporting
     * up to 48 bits of accuracy.
     * @param {number} offset Number of bytes to skip before starting to read. Must satisfy `0 <= offset <= this.length - byteLength`.
     * @param {number} byteLength Number of bytes to read. Must satisfy `0 < byteLength <= 6`.
     * @returns {number}
     */
    readUIntBE(offset, byteLength) {
         if (byteLength <= 0 || byteLength > 6) {
            throw new RangeError(`byteLength must be > 0 and <= 6 for readUIntBE, received ${byteLength}`);
        }
        this._checkBounds(offset, byteLength, 'readUIntBE');
        return this._sourceBuffer.readUIntBE(this._getAbsoluteOffset(offset), byteLength);
    }

    /**
     * Reads `byteLength` number of bytes from the buffer at the specified `offset`
     * and interprets the result as a little-endian unsigned integer supporting
     * up to 48 bits of accuracy.
     * @param {number} offset Number of bytes to skip before starting to read. Must satisfy `0 <= offset <= this.length - byteLength`.
     * @param {number} byteLength Number of bytes to read. Must satisfy `0 < byteLength <= 6`.
     * @returns {number}
     */
    readUIntLE(offset, byteLength) {
         if (byteLength <= 0 || byteLength > 6) {
            throw new RangeError(`byteLength must be > 0 and <= 6 for readUIntLE, received ${byteLength}`);
        }
        this._checkBounds(offset, byteLength, 'readUIntLE');
        return this._sourceBuffer.readUIntLE(this._getAbsoluteOffset(offset), byteLength);
    }

    /**
     * Reads `byteLength` number of bytes from the buffer at the specified `offset`
     * and interprets the result as a big-endian two's complement signed integer supporting
     * up to 48 bits of accuracy.
     * @param {number} offset Number of bytes to skip before starting to read. Must satisfy `0 <= offset <= this.length - byteLength`.
     * @param {number} byteLength Number of bytes to read. Must satisfy `0 < byteLength <= 6`.
     * @returns {number}
     */
    readIntBE(offset, byteLength) {
        if (byteLength <= 0 || byteLength > 6) {
            throw new RangeError(`byteLength must be > 0 and <= 6 for readIntBE, received ${byteLength}`);
        }
        this._checkBounds(offset, byteLength, 'readIntBE');
        return this._sourceBuffer.readIntBE(this._getAbsoluteOffset(offset), byteLength);
    }

    /**
     * Reads `byteLength` number of bytes from the buffer at the specified `offset`
     * and interprets the result as a little-endian two's complement signed integer supporting
     * up to 48 bits of accuracy.
     * @param {number} offset Number of bytes to skip before starting to read. Must satisfy `0 <= offset <= this.length - byteLength`.
     * @param {number} byteLength Number of bytes to read. Must satisfy `0 < byteLength <= 6`.
     * @returns {number}
     */
    readIntLE(offset, byteLength) {
        if (byteLength <= 0 || byteLength > 6) {
            throw new RangeError(`byteLength must be > 0 and <= 6 for readIntLE, received ${byteLength}`);
        }
        this._checkBounds(offset, byteLength, 'readIntLE');
        return this._sourceBuffer.readIntLE(this._getAbsoluteOffset(offset), byteLength);
    }

    // --- Buffer Write Methods (Example: writeUInt8) ---
    // Add other write methods following the same pattern if needed

    /**
     * Writes `value` to the buffer at the specified `offset`. `value` must be a valid
     * unsigned 8-bit integer.
     * Behavior is undefined when `value` is anything other than an unsigned 8-bit integer.
     * @param {number} value Number to be written to the buffer.
     * @param {number} [offset=0] Number of bytes to skip before starting to write. Must satisfy `0 <= offset <= this.length - 1`.
     * @returns {number} `offset + 1`.
     * @throws {RangeError} If offset is out of bounds.
     */
    writeUInt8(value, offset = 0) {
        this._checkBounds(offset, 1, 'writeUInt8');
        // The return value should be relative to this OffsetBuffer's start
        const absoluteOffset = this._getAbsoluteOffset(offset);
        this._sourceBuffer.writeUInt8(value, absoluteOffset);
        return offset + 1;
    }

    // Example for writeUIntBE (adapt for others like writeUIntLE, writeIntBE, etc.)
    /**
      * Writes `byteLength` bytes of `value` to the `buf` at the specified `offset` as big-endian. Supports up to 48 bits of accuracy.
      * @param {number} value Number to be written to `buf`.
      * @param {number} offset Number of bytes to skip before starting to write. Must satisfy `0 <= offset <= buf.length - byteLength`.
      * @param {number} byteLength Number of bytes to write. Must satisfy `0 < byteLength <= 6`.
      * @returns {number} `offset + byteLength`.
      */
    writeUIntBE(value, offset, byteLength) {
        if (byteLength <= 0 || byteLength > 6) {
            throw new RangeError(`byteLength must be > 0 and <= 6 for writeUIntBE, received ${byteLength}`);
        }
        this._checkBounds(offset, byteLength, 'writeUIntBE');
        const absoluteOffset = this._getAbsoluteOffset(offset);
        this._sourceBuffer.writeUIntBE(value, absoluteOffset, byteLength);
        // Return value is relative to this OffsetBuffer's start
        return offset + byteLength;
    }

    // --- Slicing and Copying ---

    /**
     * Returns a new `Buffer` that references the same memory as the original,
     * but offset and cropped by the `start` and `end` indices.
     * This method is inherited from `Uint8Array`.
     * **Important:** This returns a standard `Buffer`, not an `OffsetBuffer`,
     * pointing to the subsection of the *original* source buffer.
     *
     * @param {number} [start=0] Where the new Buffer will start.
     * @param {number} [end=this.length] Where the new Buffer will end (exclusive).
     * @returns {Buffer}
     */
    subarray(start = 0, end = this.length) {
        // Adjust start/end relative to this OffsetBuffer's length
        start = Math.max(0, start < 0 ? this.length + start : start);
        end = Math.min(this.length, end < 0 ? this.length + end : end);

        if (start > end) start = end; // Ensure start is not greater than end

        this._checkBounds(start, 0, 'subarray start'); // Check start boundary
        this._checkBounds(end, 0, 'subarray end'); // Check end boundary (offset=end, length=0)

        const absoluteStart = this._getAbsoluteOffset(start);
        const absoluteEnd = this._getAbsoluteOffset(end);

        // Call subarray on the original source buffer
        return this._sourceBuffer.subarray(absoluteStart, absoluteEnd);
    }

   /**
     * Returns a new `OffsetBuffer` that references the same memory as the original `OffsetBuffer`,
     * but offset and cropped by the `start` and `end` indices relative to *this* `OffsetBuffer`.
     * Modifying the new `OffsetBuffer` slice will modify the memory in the original Buffer.
     *
     * @param {number} [start=0] Where the new OffsetBuffer view will start.
     * @param {number} [end=this.length] Where the new OffsetBuffer view will end (exclusive).
     * @returns {OffsetBuffer} A new OffsetBuffer representing the slice.
     */
    slice(start = 0, end = this.length) {
        // Adjust start/end relative to this OffsetBuffer's length
        // Node Buffer slice semantics handle negative indices relative to length
        // Clamp indices within the bounds [0, this.length]
        const currentLength = this.length; // Use getter

        let relativeStart = start === undefined ? 0 : Math.trunc(start);
        let relativeEnd = end === undefined ? currentLength : Math.trunc(end);

        if (relativeStart < 0) {
            relativeStart += currentLength;
            if (relativeStart < 0) relativeStart = 0;
        } else if (relativeStart > currentLength) {
            relativeStart = currentLength;
        }

        if (relativeEnd < 0) {
            relativeEnd += currentLength;
            if (relativeEnd < 0) relativeEnd = 0;
        } else if (relativeEnd > currentLength) {
            relativeEnd = currentLength;
        }

        // Calculate new length, ensuring it's not negative
        let newLength = relativeEnd - relativeStart;
        if (newLength < 0) {
            newLength = 0;
        }

        // Create a new OffsetBuffer. The constructor handles unwrapping if 'this' is already an OffsetBuffer.
        // Pass the *relative* start offset and new length.
        return new OffsetBuffer(this, relativeStart, newLength);
    }

   /**
     * Copies data from a region of this `OffsetBuffer` to a region in `targetBuffer`.
     * @param {Buffer|Uint8Array} targetBuffer Buffer or Uint8Array to copy into.
     * @param {number} [targetStart=0] The offset within `targetBuffer` at which to begin writing.
     * @param {number} [sourceStart=0] The offset within this `OffsetBuffer` from which to begin copying.
     * @param {number} [sourceEnd=this.length] The offset within this `OffsetBuffer` at which to stop copying (exclusive).
     * @returns {number} The number of bytes copied.
     */
    copy(targetBuffer, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
        // Validate and adjust sourceStart/sourceEnd relative to this OffsetBuffer
        sourceStart = Math.max(0, sourceStart < 0 ? this.length + sourceStart : sourceStart);
        sourceEnd = Math.min(this.length, sourceEnd < 0 ? this.length + sourceEnd : sourceEnd);

        // Prevent copying if range is invalid or zero length
        if (sourceStart >= sourceEnd || sourceStart >= this.length || sourceEnd <= 0) {
            return 0;
        }
         if (sourceStart < 0 || sourceEnd > this.length ) {
              throw new RangeError('sourceStart or sourceEnd out of bounds for OffsetBuffer');
         }

        // Calculate absolute source offsets
        const absoluteSourceStart = this._getAbsoluteOffset(sourceStart);
        const absoluteSourceEnd = this._getAbsoluteOffset(sourceEnd);

        // Call copy on the underlying source buffer
        return this._sourceBuffer.copy(
            targetBuffer,
            targetStart,
            absoluteSourceStart,
            absoluteSourceEnd
        );
    }

    // --- String Conversion ---

    /**
     * Decodes a subsection of the `OffsetBuffer` into a string according to the specified character encoding.
     * @param {BufferEncoding} [encoding='utf8'] The character encoding to use.
     * @param {number} [start=0] The offset relative to this `OffsetBuffer` to start decoding from.
     * @param {number} [end=this.length] The offset relative to this `OffsetBuffer` to stop decoding at (exclusive).
     * @returns {string}
     */
    toString(encoding = 'utf8', start = 0, end = this.length) {
        // Adjust start/end relative to this OffsetBuffer's length
        start = Math.max(0, start < 0 ? this.length + start : start);
        end = Math.min(this.length, end < 0 ? this.length + end : end);

        if (start >= end || start >= this.length || end <= 0) {
            return ''; // Return empty string for invalid or zero-length range
        }
         if (start < 0 || end > this.length ) {
              throw new RangeError('start or end out of bounds for OffsetBuffer in toString');
         }

        const absoluteStart = this._getAbsoluteOffset(start);
        const absoluteEnd = this._getAbsoluteOffset(end);

        return this._sourceBuffer.toString(encoding, absoluteStart, absoluteEnd);
    }

    // --- Index Access ---

    /**
     * Gets the byte value at the specified index relative to this OffsetBuffer.
     * @param {number} index The index.
     * @returns {number} The byte value (0-255).
     * @throws {RangeError} If index is out of bounds.
    
    [index] (index) {
        if (index < 0 || index >= this.length) {
            throw new RangeError(`Index ${index} out of bounds for OffsetBuffer of length ${this.length}`);
        }
        return this._sourceBuffer[this._getAbsoluteOffset(index)];
    }

    /**
     * Sets the byte value at the specified index relative to this OffsetBuffer.
     * @param {number} index The index.
     * @param {number} value The byte value (0-255).
     * @throws {RangeError} If index is out of bounds.
    
    set [index] (index, value) {
        if (index < 0 || index >= this.length) {
            throw new RangeError(`Index ${index} out of bounds for OffsetBuffer of length ${this.length}`);
        }
        this._sourceBuffer[this._getAbsoluteOffset(index)] = value;
    }
 */
    // --- Iteration ---

    /**
     * Returns an iterator for byte values in the OffsetBuffer.
     * @returns {IterableIterator<number>}
     */
    *[Symbol.iterator]() {
        for (let i = 0; i < this.length; i++) {
            yield this._sourceBuffer[this._sourceOffset + i];
        }
    }

    /**
     * Returns an iterator for [index, byte] pairs in the OffsetBuffer.
     * @returns {IterableIterator<[number, number]>}
     */
    *entries() {
         for (let i = 0; i < this.length; i++) {
            yield [i, this._sourceBuffer[this._sourceOffset + i]];
        }
    }

    /**
     * Returns an iterator for indices (keys) in the OffsetBuffer.
     * @returns {IterableIterator<number>}
     */
    *keys() {
         for (let i = 0; i < this.length; i++) {
            yield i;
        }
    }

    /**
     * Returns an iterator for byte values in the OffsetBuffer. (Alias for Symbol.iterator)
     * @returns {IterableIterator<number>}
     */
    values() {
        return this[Symbol.iterator]();
    }

    // --- Comparison ---
    /**
     * Compares this `OffsetBuffer` to `otherBuffer`. Returns `0` if they are
     * equal, `1` if this `OffsetBuffer` comes before `otherBuffer` in sort
     * order, or `-1` if this `OffsetBuffer` comes after `otherBuffer`.
     * Comparison is based on the actual byte sequences within the view.
     *
     * @param {Buffer | Uint8Array | OffsetBuffer} otherBuffer Buffer or view to compare against.
     * @returns {0 | 1 | -1}
     */
    compare(otherBuffer) {
        if (otherBuffer instanceof OffsetBuffer) {
            // Compare section vs section efficiently
            return this._sourceBuffer.compare(
                otherBuffer._sourceBuffer,
                otherBuffer._sourceOffset, // targetStart
                otherBuffer._sourceOffset + otherBuffer.length, // targetEnd
                this._sourceOffset, // sourceStart
                this._sourceOffset + this.length // sourceEnd
            );
        } else if (otherBuffer instanceof OriginalBuffer || otherBuffer instanceof Uint8Array) {
             // Compare this section against the whole other buffer
             // We need to get a temporary buffer representing *this* section
             // to use the standard compare method easily, or implement manually.
             // Manual implementation is likely more efficient:
             const len = Math.min(this.length, otherBuffer.length);
             for(let i = 0; i < len; i++) {
                 const a = this._sourceBuffer[this._sourceOffset + i];
                 const b = otherBuffer[i];
                 if (a !== b) {
                     return a < b ? -1 : 1;
                 }
             }
             if (this.length === otherBuffer.length) return 0;
             return this.length < otherBuffer.length ? -1 : 1;

        } else {
            throw new TypeError('Argument must be a Buffer, Uint8Array, or OffsetBuffer');
        }
    }

   /**
     * Returns `true` if `otherBuffer` has the same byte sequence as this `OffsetBuffer` view.
     * @param {Buffer | Uint8Array | OffsetBuffer} otherBuffer Buffer or view to compare against.
     * @returns {boolean}
     */
    equals(otherBuffer) {
        if (otherBuffer instanceof OffsetBuffer) {
            if (this === otherBuffer) return true; // Same instance
            if (this.length !== otherBuffer.length) return false; // Different lengths
             // Use compare for efficiency
            return this.compare(otherBuffer) === 0;
        } else if (otherBuffer instanceof OriginalBuffer || otherBuffer instanceof Uint8Array) {
             if (this.length !== otherBuffer.length) return false;
             // Use compare for efficiency
             return this.compare(otherBuffer) === 0;
        } else {
            return false; // Not comparable type
        }
    }

    // --- Other useful Buffer methods ---

    /**
     * Fills the `OffsetBuffer` view with the specified `value`.
     * @param {string | Buffer | number} value The value to fill with.
     * @param {number} [offset=0] Number of bytes to skip before starting to fill. Relative to this `OffsetBuffer`.
     * @param {number} [end=this.length] Where to stop filling (exclusive). Relative to this `OffsetBuffer`.
     * @param {BufferEncoding} [encoding='utf8'] The encoding for `value` if `value` is a string.
     * @returns {this}
     */
    fill(value, offset = 0, end = this.length, encoding = 'utf8') {
         // Adjust start/end relative to this OffsetBuffer's length
        offset = Math.max(0, offset < 0 ? this.length + offset : offset);
        end = Math.min(this.length, end < 0 ? this.length + end : end);

        if (offset >= end || offset >= this.length || end <= 0) {
            return this; // Nothing to fill
        }
        if (offset < 0 || end > this.length ) {
              throw new RangeError('offset or end out of bounds for OffsetBuffer in fill');
         }

        const absoluteOffset = this._getAbsoluteOffset(offset);
        const absoluteEnd = this._getAbsoluteOffset(end);

        // Delegate to the source buffer's fill method
        this._sourceBuffer.fill(value, absoluteOffset, absoluteEnd, encoding);
        return this;
    }

    /**
     * Returns the index of the first occurrence of `value` in the `OffsetBuffer` view,
     * or -1 if `value` is not found.
     * @param {string | Buffer | number | Uint8Array} value What to search for.
     * @param {number} [byteOffset=0] Where to begin searching in this `OffsetBuffer`.
     * @param {BufferEncoding} [encoding='utf8'] If `value` is a string, this is its encoding.
     * @returns {number} The index relative to this `OffsetBuffer`, or -1.
     */
    indexOf(value, byteOffset = 0, encoding = 'utf8') {
         // Adjust byteOffset relative to this OffsetBuffer's length
        byteOffset = Math.max(0, byteOffset < 0 ? this.length + byteOffset : byteOffset);

        if (byteOffset >= this.length) {
            return -1; // Start position is beyond the buffer length
        }

        const absoluteByteOffset = this._getAbsoluteOffset(byteOffset);

        // Perform indexOf on the relevant slice of the source buffer
        const resultAbsolute = this._sourceBuffer.indexOf(
            value,
            absoluteByteOffset,
            encoding
        );

        // Check if the result is within the bounds of *this* OffsetBuffer
        if (resultAbsolute === -1 || resultAbsolute >= this._sourceOffset + this.length) {
            return -1; // Not found or found outside this view's range
        }

        // Convert absolute index back to relative index
        return resultAbsolute - this._sourceOffset;
    }

     /**
     * Returns the index of the last occurrence of `value` in the `OffsetBuffer` view,
     * searching backwards from `byteOffset`. Returns -1 if `value` is not found.
     * @param {string | Buffer | number | Uint8Array} value What to search for.
     * @param {number} [byteOffset=this.length - 1] Where to begin searching backwards in this `OffsetBuffer`.
     * @param {BufferEncoding} [encoding='utf8'] If `value` is a string, this is its encoding.
     * @returns {number} The index relative to this `OffsetBuffer`, or -1.
     */
    lastIndexOf(value, byteOffset = this.length - 1, encoding = 'utf8') {
         // Adjust byteOffset relative to this OffsetBuffer's length
         // Clamp within valid range [0, this.length - 1]
        byteOffset = byteOffset === undefined ? this.length - 1 : byteOffset;
        byteOffset = Math.min(this.length - 1, byteOffset < 0 ? this.length + byteOffset : byteOffset);

        if (byteOffset < 0) {
             return -1; // Search range is empty or invalid
        }

        const absoluteByteOffset = this._getAbsoluteOffset(byteOffset);
        const absoluteStartOffset = this._sourceOffset; // Need start limit for underlying call

        // Perform lastIndexOf on the relevant slice of the source buffer
        // Note: Node's lastIndexOf searches backwards *from* byteOffset within the buffer
        // We need to ensure it doesn't find something *before* our view starts.
        let resultAbsolute = this._sourceBuffer.lastIndexOf(
            value,
            absoluteByteOffset, // Start searching backwards from here (absolute position)
            encoding
        );

        // Check if the result is within the bounds of *this* OffsetBuffer
        // (Must be >= absoluteStartOffset)
        while(resultAbsolute !== -1 && resultAbsolute < absoluteStartOffset) {
            // Found something, but it was before our view started. Continue search
            // from the position just before the previous find.
            if (resultAbsolute <= absoluteStartOffset) return -1; // Can't search further back
            resultAbsolute = this._sourceBuffer.lastIndexOf(
                value,
                resultAbsolute - 1, // Start from one position earlier
                encoding
            );
        }

        if (resultAbsolute === -1 || resultAbsolute >= this._sourceOffset + this.length) {
            return -1; // Not found within our view
        }

        // Convert absolute index back to relative index
        return resultAbsolute - this._sourceOffset;
    }


    // --- Identification & Inspection ---

    /**
     * Returns a JSON representation of the OffsetBuffer view.
     * Behaves like Buffer.toJSON().
     * @returns {{ type: 'Buffer', data: number[] }}
     */
    toJSON() {
        // Create a standard Buffer from our view to get the correct JSON
        const tempBuf = OriginalBuffer.allocUnsafe(this.length);
        this.copy(tempBuf, 0, 0, this.length); // Copy our view data
        return tempBuf.toJSON();
    }

    /**
     * Custom inspection method for console.log etc.
     * Shows OffsetBuffer specific info.
     */
    [Symbol.for('nodejs.util.inspect.custom')](depth, options) {
        const maxBytes = options.maxBufferLength ?? 64; // How many bytes to display
        const displayLength = Math.min(this.length, maxBytes);
        const dataPreview = this._sourceBuffer.subarray(this._sourceOffset, this._sourceOffset + displayLength)
            .toString('hex')
            .replace(/(.{2})/g, '$1 ')
            .trim();
        const more = this.length > maxBytes ? ' ...' : '';

        return `OffsetBuffer <${dataPreview}${more}> (length: ${this.length}, sourceOffset: ${this._sourceOffset})`;
    }
}
/*
// Example Usage:
console.log("B\"H - Starting OffsetBuffer example");

// 1. Basic Usage with Buffer source
const source = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A]);
console.log("Original Source:", source);

const offsetBuf1 = new OffsetBuffer(source, 2, 5); // View bytes 03, 04, 05, 06, 07
console.log("\nOffsetBuffer1 (source, offset=2, length=5):", offsetBuf1);
console.log("Length:", offsetBuf1.length); // Should be 5
console.log("Source Offset:", offsetBuf1.sourceOffset); // Should be 2
console.log("Source Buffer:", offsetBuf1.sourceBuffer === source); // Should be true

console.log("ReadUInt8(0):", offsetBuf1.readUInt8(0)); // Should be 0x03
console.log("ReadUInt8(4):", offsetBuf1.readUInt8(4)); // Should be 0x07
console.log("ReadUInt16BE(1):", offsetBuf1.readUInt16BE(1)); // Should read 0x0405
console.log("ReadUInt32BE(0):", offsetBuf1.readUInt32BE(0)); // Should read 0x03040506

try {
    offsetBuf1.readUInt8(5); // Out of bounds
} catch (e) {
    console.log("Caught expected error:", e.message);
}

// 2. Usage with OffsetBuffer source
const offsetBuf2 = new OffsetBuffer(offsetBuf1, 1, 3); // View into offsetBuf1, start at its index 1, length 3
                                                       // Should view bytes 04, 05, 06 of original source
console.log("\nOffsetBuffer2 (offsetBuf1, offset=1, length=3):", offsetBuf2);
console.log("Length:", offsetBuf2.length); // Should be 3
console.log("Source Offset (absolute):", offsetBuf2.sourceOffset); // Should be 2 (from offsetBuf1) + 1 = 3
console.log("Source Buffer:", offsetBuf2.sourceBuffer === source); // Should be true (the *original* source)

console.log("ReadUInt8(0):", offsetBuf2.readUInt8(0)); // Should be 0x04
console.log("ReadUInt16BE(1):", offsetBuf2.readUInt16BE(1)); // Should read 0x0506

// 3. Slicing
const slice1 = offsetBuf1.slice(1, 4); // Relative to offsetBuf1 (bytes 04, 05, 06)
console.log("\nSlice1 (offsetBuf1.slice(1, 4)):", slice1);
console.log("Length:", slice1.length); // 3
console.log("Source Offset:", slice1.sourceOffset); // 2 (offsetBuf1) + 1 (slice) = 3
console.log("ReadUInt8(0):", slice1.readUInt8(0)); // 0x04

const slice2 = slice1.slice(1); // Relative to slice1 (bytes 05, 06)
console.log("\nSlice2 (slice1.slice(1)):", slice2);
console.log("Length:", slice2.length); // 2
console.log("Source Offset:", slice2.sourceOffset); // 3 (slice1) + 1 (slice) = 4
console.log("ReadUInt16BE(0):", slice2.readUInt16BE(0)); // 0x0506

// 4. Subarray (returns standard Buffer)
const sub = offsetBuf1.subarray(1, 4); // Relative to offsetBuf1 (bytes 04, 05, 06)
console.log("\nSubarray (offsetBuf1.subarray(1, 4)):", sub); // Should be a standard Buffer <Buffer 04 05 06>
console.log("Is Buffer?", sub instanceof OriginalBuffer); // true
console.log("Is OffsetBuffer?", sub instanceof OffsetBuffer); // false

// 5. Iteration
console.log("\nIterating offsetBuf1:");
for (const byte of offsetBuf1) {
    console.log(`  Byte: 0x${byte.toString(16).padStart(2, '0')}`);
}

// 6. Index Access
console.log("\nIndex access offsetBuf1[2]:", `0x${offsetBuf1[2].toString(16).padStart(2, '0')}`); // 0x05
offsetBuf1[2] = 0xFF; // Modify the underlying buffer via the view
console.log("Source after modification:", source); // Original source should show the change at index 4 (2+2)
console.log("offsetBuf1[2] after set:", `0x${offsetBuf1[2].toString(16).padStart(2, '0')}`); // 0xFF
// Reset for other tests
offsetBuf1[2] = 0x05;

// 7. toString
console.log("\ntoString() offsetBuf1:", offsetBuf1.toString('hex')); // 0304050607
console.log("toString(hex, 1, 3) offsetBuf1:", offsetBuf1.toString('hex', 1, 3)); // 0405

// 8. copy
const target = Buffer.alloc(5);
const bytesCopied = offsetBuf1.copy(target, 1, 2, 4); // Copy bytes at index 2,3 (0x05, 0x06) from offsetBuf1 to target starting at index 1
console.log("\nCopy Test:");
console.log("Bytes copied:", bytesCopied); // 2
console.log("Target buffer:", target); // <Buffer 00 05 06 00 00>

// 9. compare / equals
const bufA = new OffsetBuffer(source, 1, 4); // 02 03 04 05
const bufB = new OffsetBuffer(source, 5, 4); // 06 07 08 09
const bufC = Buffer.from([0x02, 0x03, 0x04, 0x05]);
const bufD = new OffsetBuffer(Buffer.from([0, 0, 2, 3, 4, 5, 0]), 2, 4); // Same content, diff source

console.log("\nCompare/Equals Test:");
console.log("bufA.compare(bufC):", bufA.compare(bufC)); // 0
console.log("bufA.equals(bufC):", bufA.equals(bufC)); // true
console.log("bufA.compare(bufB):", bufA.compare(bufB)); // -1 (02... < 06...)
console.log("bufA.equals(bufB):", bufA.equals(bufB)); // false
console.log("bufA.compare(bufD):", bufA.compare(bufD)); // 0
console.log("bufA.equals(bufD):", bufA.equals(bufD)); // true

// 10. indexOf / lastIndexOf
const searchSource = Buffer.from([10, 20, 30, 40, 30, 50, 60]);
const searchOffsetBuf = new OffsetBuffer(searchSource, 1, 5); // View: [20, 30, 40, 30, 50]
console.log("\nIndexOf/LastIndexOf Test on:", searchOffsetBuf);
console.log("indexOf(30):", searchOffsetBuf.indexOf(30));             // Should be 1 (relative index)
console.log("indexOf(30, 2):", searchOffsetBuf.indexOf(30, 2));       // Should be 3 (relative index)
console.log("indexOf(99):", searchOffsetBuf.indexOf(99));             // Should be -1
console.log("lastIndexOf(30):", searchOffsetBuf.lastIndexOf(30));       // Should be 3 (relative index)
console.log("lastIndexOf(30, 2):", searchOffsetBuf.lastIndexOf(30, 2)); // Should be 1 (relative index)
console.log("lastIndexOf(20):", searchOffsetBuf.lastIndexOf(20));       // Should be 0


console.log("\nB\"H - Example Finished");
*/

module.exports = OffsetBuffer