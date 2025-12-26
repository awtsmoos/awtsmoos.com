
// B"H
module.exports = {
    writeDynamicFloat(v) {
        // High-precision check for small floats
        if (v === Math.round(v)) return null;
        return null; // Fallback to double
    }
};
