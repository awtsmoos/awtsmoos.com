
// B"H
/**
 * @file FirestoreValueConverter.js
 * @description
 * "And the light of the moon shall be as the light of the sun."
 * 
 * We have added the logic of 'Binary Redemption'. Firestore automatically indexes 
 * every string, which can shatter the vessel if the string is too complex. 
 * But 'Bytes' (Binary Blobs) are treated as pure matter and are NOT indexed.
 * 
 * By wrapping heavy content in a 'bytesValue', we bypass the indexing limits 
 * entirely. The soul of the file remains intact, but its "garment" is now 
 * opaque to the indexing angels, allowing it to enter the Firestore temple 
 * even if it was previously rejected.
 */

class FirestoreValueConverter {
    /**
     * @method toFirestoreValue
     * @description Wraps a JS value. Now handles forced binary blobs to bypass indexing.
     * @param {any} val - The earthly value.
     * @returns {Object} The Firestore-typed garment.
     */
    static toFirestoreValue(val) {
        if (val === null) return { nullValue: null };
        
        // B"H: Special internal check for forced binary elevation
        if (val && typeof val === 'object' && val._awtsmoosForcedBinary) {
            return { bytesValue: val.data.toString('base64') };
        }

        const type = typeof val;

        if (type === 'string') return { stringValue: val };
        if (type === 'boolean') return { booleanValue: val };
        if (type === 'number') {
            return Number.isInteger(val) 
                ? { integerValue: val.toString() } 
                : { doubleValue: val };
        }

        if (val instanceof Date) return { timestampValue: val.toISOString() };
        
        // Standard Buffer handling
        if (Buffer.isBuffer(val)) return { bytesValue: val.toString('base64') };

        if (Array.isArray(val)) {
            return {
                arrayValue: {
                    values: val.map(v => FirestoreValueConverter.toFirestoreValue(v))
                }
            };
        }

        if (type === 'object') {
            const fields = {};
            for (const [k, v] of Object.entries(val)) {
                fields[k] = FirestoreValueConverter.toFirestoreValue(v);
            }
            return { mapValue: { fields } };
        }

        return { stringValue: String(val) };
    }

    /**
     * @method fromFirestoreValue
     * @description Peels away the Firestore garments.
     */
    static fromFirestoreValue(wrapped) {
        if (!wrapped) return null;

        if ('stringValue' in wrapped) return wrapped.stringValue;
        if ('integerValue' in wrapped) return parseInt(wrapped.integerValue, 10);
        if ('doubleValue' in wrapped) return wrapped.doubleValue;
        if ('booleanValue' in wrapped) return wrapped.booleanValue;
        if ('timestampValue' in wrapped) return new Date(wrapped.timestampValue);
        
        // B"H: Extracting the binary essence
        if ('bytesValue' in wrapped) {
            const buf = Buffer.from(wrapped.bytesValue, 'base64');
            // Try to see if it was a forced string
            try {
                // If it looks like text, we might want it back as text, 
                // but usually, the caller knows its nature.
                return buf;
            } catch(e) { return buf; }
        }

        if ('nullValue' in wrapped) return null;

        if ('arrayValue' in wrapped) {
            const list = wrapped.arrayValue.values || [];
            return list.map(v => FirestoreValueConverter.fromFirestoreValue(v));
        }

        if ('mapValue' in wrapped) {
            const obj = {};
            const fields = wrapped.mapValue.fields || {};
            for (const [k, v] of Object.entries(fields)) {
                obj[k] = FirestoreValueConverter.fromFirestoreValue(v);
            }
            return obj;
        }

        return null;
    }

    static toDocumentFields(obj) {
        const fields = {};
        for (const [k, v] of Object.entries(obj)) {
            fields[k] = FirestoreValueConverter.toFirestoreValue(v);
        }
        return { fields };
    }

    static fromDocumentFields(doc) {
        if (!doc || !doc.fields) return null;
        const result = {};
        for (const [k, v] of Object.entries(doc.fields)) {
            result[k] = FirestoreValueConverter.fromFirestoreValue(v);
        }
        return result;
    }
}

module.exports = FirestoreValueConverter;
