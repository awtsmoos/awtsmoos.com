
// B"H
/**
 * @file traps/index.js
 * @description 
 *  The Sefirah of Hod (Splendor) - The Interface Layer.
 *  This module forges the Proxy traps that bridge JS intentions to binary existence.
 */
const GetTrap = require('./get.js');
const SetTrap = require('./set.js');
const HasTrap = require('./has.js');
const KeysTrap = require('./keys.js');
const DeleteTrap = require('./delete.js');
const DescriptorTrap = require('./descriptor.js');

module.exports = {
    createTraps: (state, target) => {
        return {
            get: (tgt, prop, receiver) => GetTrap.handle(state, tgt, prop, receiver),
            set: (tgt, prop, value) => SetTrap.handle(state, tgt, prop, value),
            deleteProperty: (tgt, prop) => DeleteTrap.handle(state, tgt, prop),
            ownKeys: (tgt) => KeysTrap.handle(state, tgt),
            has: (tgt, prop) => HasTrap.handle(state, tgt, prop),
            getOwnPropertyDescriptor: (tgt, prop) => DescriptorTrap.handle(state, tgt, prop)
        };
    }
};
