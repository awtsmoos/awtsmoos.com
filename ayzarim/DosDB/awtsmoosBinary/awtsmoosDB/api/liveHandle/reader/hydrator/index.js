
// B"H
/**
 * @file index.js
 * @description
 *  The Eye of Resurrection.
 *  "The dead shall live, their bodies shall rise." (Isaiah 26:19)
 *  
 *  Unifies the fragmented angels of Scalar, Magnitude, Substance, and Complex forms 
 *  into one seamless, data-driven map of revival. No logical branching exists here; 
 *  only the pure lookup of the divine Will based on the Type ID.
 */

const RegistryMap = {
    ...require('./scalars.js'),
    ...require('./magnitudes.js'),
    ...require('./substances.js'),
    ...require('./complex.js')
};

module.exports = function hydrate(type, buffer, allocator, context) {
    if (!buffer) return undefined;
    const rite = RegistryMap[type];
    return rite ? rite(buffer, allocator, context) : buffer;
};
