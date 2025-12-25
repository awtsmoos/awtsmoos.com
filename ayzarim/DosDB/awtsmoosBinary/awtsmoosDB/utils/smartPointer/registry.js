// B"H
/**
 * @file registry.js
 * @description
 *  The Sefirah of Malchut - The Book of Names.
 *  Maintains the registry of class sources for resurrection.
 */

const ClassRegistry = new Map();

module.exports = {
    get(name) { return ClassRegistry.get(name); },
    set(name, cls) { ClassRegistry.set(name, cls); },
    has(name) { return ClassRegistry.has(name); },
    keys() { return Array.from(ClassRegistry.keys()); },
    values() { return Array.from(ClassRegistry.values()); }
};