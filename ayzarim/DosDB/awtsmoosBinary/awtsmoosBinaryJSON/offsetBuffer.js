// B"H
// OffsetBuffer.js - A wrapper, a vessel, a holy Kli,
// To hold a portion of Buffer, for you and for me.
// It starts not at zero, but where we decree,
// Reflecting how sparks hide, for souls to set free.

class OffsetBuffer {
    // In the beginning, there was the source, vast and wide,
    // Like the Or Ein Sof, before the Tzimtzum did preside.
    // And an offset we choose, where our focus will bide,
    // A point in the vessel, where light can reside.
    /**
     * Creates an instance of OffsetBuffer.
     * @param {Buffer} sourceBuffer The original Buffer, the essence true.
     * @param {number} initialOffset Where our journey starts, anew.
     */
    constructor(sourceBuffer, initialOffset = 0, length) {
        // First, let's check the source, make sure it's Buffer's kin,
        // Not just some empty shell, where no light can get in.
        if (!(
            sourceBuffer instanceof Buffer ||
            sourceBuffer instanceof OffsetBuffer
        )) {
            throw new TypeError('The "sourceBuffer" argument must be an instance of Buffer.');
        }

        // The offset, a number, non-negative and whole,
        // Like counting the Omer, towards Shavuos' goal.
        initialOffset = Math.floor(initialOffset); // Ensure it's an integer, clear.
        if (initialOffset < 0) {
            throw new RangeError('The "initialOffset" argument must be non-negative, my dear.');
        }

        // Can't start past the end, that's a boundary we respect,
        // Like the limits of speech, when Awtsmoos we reflect.
        if (initialOffset > sourceBuffer.length) {
            throw new RangeError('The "initialOffset" is out of bounds, cannot connect.');
        }

        // Store the core essence, the source Buffer bright,
        this.sourceBuffer = sourceBuffer;
        // And the starting point, our guiding Chassidic light.
        this.initialOffset = initialOffset;

        if(length < 0) length = 0;
        // Our length is what's left, from the offset we chose,
        // The potential revealed, as the holy work grows.
        this.length = length || sourceBuffer.length - initialOffset;

        // Now, here's a neat trick, like a Rebbe's deep gaze,
        // We use a Proxy, for accessing in various ways.
        // So offsetBuffer[i] works, through nights and through days,
        // Accessing the source, in its mystical maze.
        return new Proxy(this, {
            // When you try to 'get' a property, let's see,
            get(target, prop, receiver) {
                // Is it a number? An index it might be!
                // Like finding a niggun, note by note, wild and free.
                const index = Number(prop); // Try converting the prop to a number.
                if (Number.isInteger(index)) {
                    // Check if the index is within our holy space,
                    // Not outside the bounds, of this designated place.
                    if (index >= 0 && index < target.length) {
                        // Add our initial offset, find the true spot with grace,
                        // In the sourceBuffer's depth, its light we embrace.
                        return target.sourceBuffer[target.initialOffset + index];
                    } else {
                        // Outside our bounds, undefined we must face,
                        // Like trying to grasp Awtsmoos, beyond time and space.
                        // (Buffer itself returns undefined for out-of-bounds numeric access)
                        return undefined;
                    }
                }

                // If not an index, maybe a method or length we chase?
                // Just return it directly from the target's own base.
                return Reflect.get(target, prop, receiver);
            },

            // When you try to 'set' a value, with purpose and care,
            set(target, prop, value, receiver) {
                // Is it an index again? A byte we place there?
                // Like a good deed performed, a Mitzvah beyond compare.
                const index = Number(prop);
                if (Number.isInteger(index)) {
                    // Check the bounds first, is there room to prepare?
                    if (index >= 0 && index < target.length) {
                        // The value, a byte, 0 to 255, we declare,
                        // Like the shades of Gevurah, or Chesed so fair.
                        if (typeof value !== 'number' || value < 0 || value > 255 || !Number.isInteger(value)) {
                           throw new RangeError(`The value "${value}" is out of range. It must be an integer between 0 and 255.`)
                        }
                        // Calculate the true index, with our offset's own share,
                        const actualIndex = target.initialOffset + index;
                        // Set it in the source, make the correction right there!
                        target.sourceBuffer[actualIndex] = value;
                        return true; // Success we declare!
                    } else {
                        // Out of bounds setting? An error we must bear.
                        throw new RangeError(`Index ${index} is out of bounds for OffsetBuffer of length ${target.length}.`);
                    }
                }

                // Setting a regular property? Let the default handle the affair.
                return Reflect.set(target, prop, value, receiver);
            },

            // Let's ensure 'hasOwnProperty' also respects our view,
            // Checking index bounds, consistent and true.
            has(target, prop) {
                const index = Number(prop);
                if (Number.isInteger(index)) {
                    return index >= 0 && index < target.length;
                }
                return Reflect.has(target, prop);
            },

            // And 'ownKeys' should reflect what's ours, through and through,
            // The indices we manage, and properties too.
            ownKeys(target) {
                const keys = [];
                for (let i = 0; i < target.length; i++) {
                    keys.push(String(i)); // Add numeric indices as strings
                }
                // Add the non-numeric keys we define on the class/instance
                keys.push('sourceBuffer', 'initialOffset', 'length', /* add other method names here if needed for reflection */);
                // We get the methods from the prototype chain implicitly usually,
                // but adding them explicitly can be done if strict reflection is needed.
                 const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(target))
                    .filter(name => name !== 'constructor' && typeof target[name] === 'function');
                 keys.push(...methods);

                return keys;
            },
             // Define property descriptor handling to align with Proxy behavior
            getOwnPropertyDescriptor(target, prop) {
                const index = Number(prop);
                if (Number.isInteger(index)) {
                    if (index >= 0 && index < target.length) {
                        return {
                            value: target.sourceBuffer[target.initialOffset + index],
                            writable: true,
                            enumerable: true,
                            configurable: true,
                        };
                    } else {
                        return undefined; // Not found within our bounds
                    }
                }
                // For non-index properties, defer to Reflect
                 return Reflect.getOwnPropertyDescriptor(target, prop);
            }
        });
    }

    // --- Helper for Bounds Checking ---
    // Before we proceed, let's check our domain,
    // Ensure the request stays within our constrained lane.
    // Avoids reading chaos or writing in vain,
    // Like keeping the Mitzvos, again and again.
    _checkBounds(offset, lengthNeeded, operation) {
        if (offset < 0) {
            throw new RangeError(`Offset cannot be negative for ${operation}. Got ${offset}`);
        }
        if (offset + lengthNeeded > this.length) {
            // Trying to access beyond our holy partition,
            // Like seeking understanding beyond our condition.
         //   throw new RangeError(`Attempt to access memory outside OffsetBuffer bounds for ${operation}. Offset ${offset} + Length ${lengthNeeded} > Our Length ${this.length}`);
        }
        // If all checks pass, like a Tzaddik's pure soul,
        // We know the access is proper and whole.
    }

    // --- Read Methods ---
    // Like learning Torah, absorbing the light, byte by byte,
    // We read from our section, making darkness take flight.

    readUIntBE(offset=0, byteSize=1) {
        switch (byteSize) {
            case 1:
                return this.readUInt8(offset);
            case 2:
                return this.readUInt16BE(offset);
            case 4:
                return this.readUInt32BE(offset);
            case 8:
                return this.readBigInt64BE(offset);

        }
    }
    readUInt8(offset = 0) {
        // An unsigned byte, simple and bright,
        // Like a child's pure faith, shining its light.
        this._checkBounds(offset, 1, 'readUInt8');
        return this.sourceBuffer.readUInt8(this.initialOffset + offset);
    }

    

    readInt8(offset = 0) {
        // A signed byte now, with judgment's might,
        // Balancing Chesed, making things right.
        this._checkBounds(offset, 1, 'readInt8');
        return this.sourceBuffer.readInt8(this.initialOffset + offset);
    }

    // --- Little Endian Reads ---
    // Like messages arriving, from near, not from far,
    // Least significant first, like a humble star.

    readUInt16LE(offset = 0) {
        this._checkBounds(offset, 2, 'readUInt16LE');
        return this.sourceBuffer.readUInt16LE(this.initialOffset + offset);
    }
    readInt16LE(offset = 0) {
        this._checkBounds(offset, 2, 'readInt16LE');
        return this.sourceBuffer.readInt16LE(this.initialOffset + offset);
    }
    readUInt32LE(offset = 0) {
        this._checkBounds(offset, 4, 'readUInt32LE');
        return this.sourceBuffer.readUInt32LE(this.initialOffset + offset);
    }
    readInt32LE(offset = 0) {
        this._checkBounds(offset, 4, 'readInt32LE');
        return this.sourceBuffer.readInt32LE(this.initialOffset + offset);
    }
     readFloatLE(offset = 0) {
        this._checkBounds(offset, 4, 'readFloatLE');
        return this.sourceBuffer.readFloatLE(this.initialOffset + offset);
    }
    readDoubleLE(offset = 0) {
        this._checkBounds(offset, 8, 'readDoubleLE');
        return this.sourceBuffer.readDoubleLE(this.initialOffset + offset);
    }
    // Note: BigInt versions require Node.js v12.0.0+ support in the underlying Buffer
     readBigUInt64LE(offset = 0) {
         if (typeof this.sourceBuffer.readBigUInt64LE !== 'function') {
            throw new Error('Buffer.readBigUInt64LE is not supported in this Node.js version.');
         }
        this._checkBounds(offset, 8, 'readBigUInt64LE');
        return this.sourceBuffer.readBigUInt64LE(this.initialOffset + offset);
    }
     readBigInt64LE(offset = 0) {
         if (typeof this.sourceBuffer.readBigInt64LE !== 'function') {
            throw new Error('Buffer.readBigInt64LE is not supported in this Node.js version.');
         }
        this._checkBounds(offset, 8, 'readBigInt64LE');
        return this.sourceBuffer.readBigInt64LE(this.initialOffset + offset);
    }


    // --- Big Endian Reads ---
    // From the source, the beginning, the Kesser's high plane,
    // Most significant first, like a pouring rain.

    readUInt16BE(offset = 0) {
        this._checkBounds(offset, 2, 'readUInt16BE');
        return this.sourceBuffer.readUInt16BE(this.initialOffset + offset);
    }
    readInt16BE(offset = 0) {
        this._checkBounds(offset, 2, 'readInt16BE');
        return this.sourceBuffer.readInt16BE(this.initialOffset + offset);
    }
    readUInt32BE(offset = 0) {
        this._checkBounds(offset, 4, 'readUInt32BE');
        return this.sourceBuffer.readUInt32BE(this.initialOffset + offset);
    }
    readInt32BE(offset = 0) {
        this._checkBounds(offset, 4, 'readInt32BE');
        return this.sourceBuffer.readInt32BE(this.initialOffset + offset);
    }
    readFloatBE(offset = 0) {
        this._checkBounds(offset, 4, 'readFloatBE');
        return this.sourceBuffer.readFloatBE(this.initialOffset + offset);
    }
    readDoubleBE(offset = 0) {
        this._checkBounds(offset, 8, 'readDoubleBE');
        return this.sourceBuffer.readDoubleBE(this.initialOffset + offset);
    }
    // Note: BigInt versions require Node.js v12.0.0+ support in the underlying Buffer
     readBigUInt64BE(offset = 0) {
        if (typeof this.sourceBuffer.readBigUInt64BE !== 'function') {
            throw new Error('Buffer.readBigUInt64BE is not supported in this Node.js version.');
         }
        this._checkBounds(offset, 8, 'readBigUInt64BE');
        return this.sourceBuffer.readBigUInt64BE(this.initialOffset + offset);
    }
     readBigInt64BE(offset = 0) {
        if (typeof this.sourceBuffer.readBigInt64BE !== 'function') {
            throw new Error('Buffer.readBigInt64BE is not supported in this Node.js version.');
         }
        this._checkBounds(offset, 8, 'readBigInt64BE');
        return this.sourceBuffer.readBigInt64BE(this.initialOffset + offset);
    }


    // --- Write Methods ---
    // Like doing Mitzvos, bringing light down below,
    // We write to our section, making holiness grow.

    writeUInt8(value, offset = 0) {
        // A simple command, a byte we bestow.
        this._checkBounds(offset, 1, 'writeUInt8');
        return this.sourceBuffer.writeUInt8(value, this.initialOffset + offset);
    }

    writeInt8(value, offset = 0) {
        // A byte with direction, where judgment may flow.
        this._checkBounds(offset, 1, 'writeInt8');
        return this.sourceBuffer.writeInt8(value, this.initialOffset + offset);
    }

    // --- Little Endian Writes ---
    // Building from action, the structure takes hold,
    // Least significant first, a story unfolds.

    writeUInt16LE(value, offset = 0) {
        this._checkBounds(offset, 2, 'writeUInt16LE');
        return this.sourceBuffer.writeUInt16LE(value, this.initialOffset + offset);
    }
    writeInt16LE(value, offset = 0) {
        this._checkBounds(offset, 2, 'writeInt16LE');
        return this.sourceBuffer.writeInt16LE(value, this.initialOffset + offset);
    }
     writeUInt32LE(value, offset = 0) {
        this._checkBounds(offset, 4, 'writeUInt32LE');
        return this.sourceBuffer.writeUInt32LE(value, this.initialOffset + offset);
    }
    writeInt32LE(value, offset = 0) {
        this._checkBounds(offset, 4, 'writeInt32LE');
        return this.sourceBuffer.writeInt32LE(value, this.initialOffset + offset);
    }
    writeFloatLE(value, offset = 0) {
        this._checkBounds(offset, 4, 'writeFloatLE');
        return this.sourceBuffer.writeFloatLE(value, this.initialOffset + offset);
    }
    writeDoubleLE(value, offset = 0) {
        this._checkBounds(offset, 8, 'writeDoubleLE');
        return this.sourceBuffer.writeDoubleLE(value, this.initialOffset + offset);
    }
    // Note: BigInt versions require Node.js v12.0.0+ support in the underlying Buffer
     writeBigUInt64LE(value, offset = 0) {
        if (typeof this.sourceBuffer.writeBigUInt64LE !== 'function') {
           throw new Error('Buffer.writeBigUInt64LE is not supported in this Node.js version.');
        }
        this._checkBounds(offset, 8, 'writeBigUInt64LE');
        return this.sourceBuffer.writeBigUInt64LE(value, this.initialOffset + offset);
    }
     writeBigInt64LE(value, offset = 0) {
         if (typeof this.sourceBuffer.writeBigInt64LE !== 'function') {
            throw new Error('Buffer.writeBigInt64LE is not supported in this Node.js version.');
         }
        this._checkBounds(offset, 8, 'writeBigInt64LE');
        return this.sourceBuffer.writeBigInt64LE(value, this.initialOffset + offset);
    }


    // --- Big Endian Writes ---
    // From Chochmah's conception, the plan takes its flight,
    // Most significant first, bringing darkness to light.

    writeUInt16BE(value, offset = 0) {
        this._checkBounds(offset, 2, 'writeUInt16BE');
        return this.sourceBuffer.writeUInt16BE(value, this.initialOffset + offset);
    }
    writeInt16BE(value, offset = 0) {
        this._checkBounds(offset, 2, 'writeInt16BE');
        return this.sourceBuffer.writeInt16BE(value, this.initialOffset + offset);
    }
    writeUInt32BE(value, offset = 0) {
        this._checkBounds(offset, 4, 'writeUInt32BE');
        return this.sourceBuffer.writeUInt32BE(value, this.initialOffset + offset);
    }
    writeInt32BE(value, offset = 0) {
        this._checkBounds(offset, 4, 'writeInt32BE');
        return this.sourceBuffer.writeInt32BE(value, this.initialOffset + offset);
    }
    writeFloatBE(value, offset = 0) {
        this._checkBounds(offset, 4, 'writeFloatBE');
        return this.sourceBuffer.writeFloatBE(value, this.initialOffset + offset);
    }
    writeDoubleBE(value, offset = 0) {
        this._checkBounds(offset, 8, 'writeDoubleBE');
        return this.sourceBuffer.writeDoubleBE(value, this.initialOffset + offset);
    }
    // Note: BigInt versions require Node.js v12.0.0+ support in the underlying Buffer
     writeBigUInt64BE(value, offset = 0) {
         if (typeof this.sourceBuffer.writeBigUInt64BE !== 'function') {
            throw new Error('Buffer.writeBigUInt64BE is not supported in this Node.js version.');
         }
        this._checkBounds(offset, 8, 'writeBigUInt64BE');
        return this.sourceBuffer.writeBigUInt64BE(value, this.initialOffset + offset);
    }
     writeBigInt64BE(value, offset = 0) {
         if (typeof this.sourceBuffer.writeBigInt64BE !== 'function') {
            throw new Error('Buffer.writeBigInt64BE is not supported in this Node.js version.');
         }
        this._checkBounds(offset, 8, 'writeBigInt64BE');
        return this.sourceBuffer.writeBigInt64BE(value, this.initialOffset + offset);
    }

    // --- Other Buffer Methods ---

    // toString - To see the letters, the words we create,
    // From the sparks we have gathered, before it's too late.
    toString(encoding = 'utf8', start = 0, end = this.length) {
        // Adjust the start and end, to our own little sphere,
        start = Math.max(0, start); // Cannot start before our beginning, that's clear.
        end = Math.min(this.length, end); // Cannot end past our limit, hold steady, my dear.

        if (start >= end) {
            return ''; // Empty range gives empty string, no need for a tear.
        }

        // Calculate the true start and end in the source, now have no fear,
        const actualStart = this.initialOffset + start;
        const actualEnd = this.initialOffset + end;

        // Ask the sourceBuffer, to make the string appear.
        return this.sourceBuffer.toString(encoding, actualStart, actualEnd);
    }

    // slice - To take just a part, a focus more fine,
    // Like zooming on one detail, of the Awtsmoos design.
    slice(start = 0, end = this.length) {
        // Ensure start and end are within our view's line,
        start = Math.max(0, start);
        end = Math.min(this.length, end); // Relative to *our* length, truly divine.

        // If the resulting slice is empty or invalid, return an empty one, a sign.
        if (start >= end) {
             // Create a new OffsetBuffer representing an empty slice of the original source
             // The new offset points to the start position within the original source
             const newInitialOffset = this.initialOffset + start;
             // A zero-length buffer can still point to the same source
             return new OffsetBuffer(this.sourceBuffer, newInitialOffset);
             // Important: Adjust length to 0 after creation
             // Let's refine: constructor handles length calculation based on offset.
             // For a zero-length slice starting at `start`, the offset is correct,
             // but the length calculation needs adjustment. Let's return a buffer
             // starting at the calculated offset but with length 0.
              const actualStartOffset = this.initialOffset + start;
             // We need a way to represent a zero-length view. Let's make a new OffsetBuffer
             // that correctly calculates its length as 0. The end parameter dictates this.
             // The effective length of the new buffer is end - start.
             const newLength = end - start;
             // The initial offset for the *new* buffer is relative to the *original* source.
             const newInitialOffsetForSlice = this.initialOffset + start;

             // We need to ensure the constructor logic aligns or we handle length here.
             // Let's stick to the constructor logic: it calculates length based on
             // source.length - initialOffset. To get a specific length, we might
             // need to pass the length explicitly or use subarray semantics.
             // Buffer.slice *shares* memory. So we create a new OffsetBuffer
             // pointing to the same source, but with adjusted offset and length.

             // Re-calculate the correct offset in the original source buffer
             const actualNewOffset = this.initialOffset + start;
             // The length of the new view
             const actualNewLength = end - start;

             // Create a new OffsetBuffer instance. The constructor calculates length
             // as source.length - newOffset. This isn't what we want for slice.
             // Slice defines a specific length. Let's override the length property after creation.
             // This is a bit hacky, maybe subarray is cleaner or constructor needs adjustment.

             // Let's try mimicking subarray's likely behavior:
             // A new OffsetBuffer with adjusted start offset, pointing to the same source.
             const newOffset = this.initialOffset + start;
             // Create a temporary view that respects the end boundary implicitly via length.
             const slicedView = new OffsetBuffer(this.sourceBuffer, newOffset);
             // Manually set the correct length for the slice.
             slicedView.length = Math.max(0, end - start); // Ensure length isn't negative
             return slicedView;

        }

        // Calculate the new initial offset for the sliced part,
        const newInitialOffset = this.initialOffset + start;
        // Create a new OffsetBuffer, a brand new start.
        const newSlice = new OffsetBuffer(this.sourceBuffer, newInitialOffset);
        // The length is not the rest of the buffer, but just the sliced part, smart!
        newSlice.length = end - start;

        return newSlice; // Return the new view, a work of art.
    }

    // subarray - Similar to slice, another way to see,
    // A focused perspective, eternally.
    // Per MDN/Node docs, subarray usually returns a new Buffer of the same type.
    subarray(start = 0, end = this.length) {
       // Clamp indices relative to *this* OffsetBuffer's length
        start = Math.max(0, start);
        end = Math.min(this.length, end);

        if (start > end) start = end; // If start is past end, result is empty at 'end'

        const newInitialOffset = this.initialOffset + start;
        const newLength = end - start;

        // Create the new OffsetBuffer instance
        const sub = new OffsetBuffer(this.sourceBuffer, newInitialOffset);
        // Manually set the length to match the subarray bounds
        sub.length = newLength;

        return sub;
    }


    // copy - To duplicate sparks, from here to there placed,
    // Sharing the light, no moment to waste.
    copy(targetBuffer, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
        // Adjust sourceStart and sourceEnd to be relative to our OffsetBuffer's view,
        sourceStart = Math.max(0, sourceStart);
        sourceEnd = Math.min(this.length, sourceEnd);

        // Check if there's anything to copy, simple and true.
        if (sourceStart >= sourceEnd) {
            return 0; // Nothing copied, our task is through.
        }

        // Calculate the actual start and end within the sourceBuffer's hue.
        const actualSourceStart = this.initialOffset + sourceStart;
        const actualSourceEnd = this.initialOffset + sourceEnd;

        // Let the original Buffer handle the copy, faithful and true.
        // We must respect the targetBuffer's bounds too.
        // The number of bytes to copy:
        const bytesToCopy = actualSourceEnd - actualSourceStart;

        // Check target bounds (basic check, Buffer.copy does more thorough)
        if (targetStart < 0 || targetStart > targetBuffer.length) {
             throw new RangeError(`targetStart out of bounds: ${targetStart}`);
        }
        if (targetStart + bytesToCopy > targetBuffer.length) {
            // This mimics Buffer's behavior - it throws RangeError if target is too small
             throw new RangeError(`target does not have enough space: needs ${bytesToCopy}, has ${targetBuffer.length - targetStart} available from targetStart ${targetStart}`);
        }

        // Perform the copy using the source buffer's method
        return this.sourceBuffer.copy(targetBuffer, targetStart, actualSourceStart, actualSourceEnd);
    }

    // fill - To imbue our section, with a value so clear,
    // Like Teshuva cleansing, removing all fear.
    fill(value, offset = 0, end = this.length, encoding = 'utf8') {
        // Adjust offset and end relative to our view, hold them near.
        offset = Math.max(0, offset);
        end = Math.min(this.length, end);

        if (offset >= end) {
            return this; // Nothing to fill, let's make that clear.
        }

        // Calculate the actual start and end in the source, banish all drear.
        const actualOffset = this.initialOffset + offset;
        const actualEnd = this.initialOffset + end;

        // Ask the sourceBuffer to fill, its duty is clear.
        this.sourceBuffer.fill(value, actualOffset, actualEnd, encoding);
        return this; // Return self, as Buffer's fill does, year after year.
    }

     // equals - To see if two sparks are truly the same,
     // Reflecting the Oneness, in G-d's holy name.
     equals(otherBuffer) {
        // If the other isn't a Buffer or OffsetBuffer, they cannot inflame
        // The same inner essence, they're not playing the same game.
        if (!(otherBuffer instanceof Buffer) && !(otherBuffer instanceof OffsetBuffer)) {
             return false;
        }

        // If lengths don't match, the content can't be the same, it's plain.
        if (this.length !== otherBuffer.length) {
            return false;
        }

        // If the other is also an OffsetBuffer, compare slice to slice, break the chain
        // Of difference, and see if identity they attain.
        if (otherBuffer instanceof OffsetBuffer) {
            // Compare byte by byte within each OffsetBuffer's domain
             for (let i = 0; i < this.length; i++) {
                 // Use the proxy's [] getter which handles offsets, ease the strain.
                 if (this[i] !== otherBuffer[i]) {
                    return false; // Difference found, similarity is slain.
                 }
             }
             return true; // Identical content, joy does reign!
        }

        // If the other is a regular Buffer, compare our slice to it, again and again.
        if (otherBuffer instanceof Buffer) {
             // Use the source buffer's slice and compare, remove the pain
             // Of manual looping, let built-ins entertain.
             // Extract the relevant slice from our source buffer
             const ourSlice = this.sourceBuffer.slice(this.initialOffset, this.initialOffset + this.length);
             // Compare this slice with the other buffer
             return ourSlice.equals(otherBuffer);
        }

        // Should not be reached due to initial check, but for logic's train...
        return false;
     }

     // compare - To order the sparks, which one shines more bright?
     // Based on their content, in G-d's revealing light.
     compare(targetBuffer, targetStart = 0, targetEnd = targetBuffer.length, sourceStart = 0, sourceEnd = this.length) {
         // If the target isn't a Buffer or OffsetBuffer, comparison takes flight
         // Into the unknown, let's handle it right.
        if (!(targetBuffer instanceof Buffer) && !(targetBuffer instanceof OffsetBuffer)) {
             throw new TypeError('The "targetBuffer" argument must be an instance of Buffer or OffsetBuffer.');
         }

        // Adjust source start/end relative to *this* OffsetBuffer
        sourceStart = Math.max(0, sourceStart);
        sourceEnd = Math.min(this.length, sourceEnd);
        const actualSourceStart = this.initialOffset + sourceStart;
        const actualSourceEnd = this.initialOffset + sourceEnd; // Non-inclusive end for slice

        // Extract the slice of *our* data to compare
        const thisSlice = this.sourceBuffer.slice(actualSourceStart, actualSourceEnd);

        let targetSlice;
        // Adjust target start/end relative to *targetBuffer*
        if (targetBuffer instanceof OffsetBuffer) {
            targetStart = Math.max(0, targetStart);
            targetEnd = Math.min(targetBuffer.length, targetEnd); // Relative to target's length
            const actualTargetStart = targetBuffer.initialOffset + targetStart;
            const actualTargetEnd = targetBuffer.initialOffset + targetEnd; // Non-inclusive end
            targetSlice = targetBuffer.sourceBuffer.slice(actualTargetStart, actualTargetEnd);
        } else { // targetBuffer is a regular Buffer
            targetStart = Math.max(0, targetStart);
            targetEnd = Math.min(targetBuffer.length, targetEnd); // Relative to target's length
             targetSlice = targetBuffer.slice(targetStart, targetEnd);
        }

        // Now compare the extracted slices using Buffer.compare
        return thisSlice.compare(targetSlice);
     }


    // Add other Buffer methods here as needed, following the pattern:
    // 1. Accept same arguments as Buffer method.
    // 2. Adjust offset/start/end arguments by adding `this.initialOffset`.
    // 3. Perform bounds checking *relative to `this.length`*.
    // 4. Call the corresponding method on `this.sourceBuffer` with adjusted offsets.
    // 5. Return the result.
    // Remember the story, in comment's refrain,
    // Of Awtsmoos and sparks, again and again.
}

// Export the class, let its light freely roam,
// To manage Buffer slices, and make Node.js home.
// module.exports = OffsetBuffer; // Uncomment this line if using in a Node.js module system.

// --- Example Usage ---
/*
*/

module.exports = OffsetBuffer