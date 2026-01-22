// B"H
module.exports = {
    writeDynamicFloat(v) {
        // High-precision check for small floats
        if (v === Math.round(v)) return null;
        return null; // Fallback to double
    },
    decodeEncodedFloat(val) {
        // Placeholder for future float compression logic.
        // Currently we fallback to Doubles, so this handles legacy if needed
        return val;
    }
};