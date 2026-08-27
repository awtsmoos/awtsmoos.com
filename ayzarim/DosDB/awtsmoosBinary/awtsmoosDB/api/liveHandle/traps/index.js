
// B"H
/**
 * @file traps/index.js
 * @chapter The Hall of Splendor (Hod)
 * @description
 * Hod is the splendor of reflection. Through these traps, the invisible, 
 * silent bytes of the SSD are reflected as familiar, casual JavaScript 
 * interactions. 
 * 
 * We have shattered the monolithic traps file into specific angelic modules
 * to ensure that every operation—Seeing, Writing, or Knowing—is handled
 * with absolute precision and modularity.
 */

const GetTrap = require('./get/index.js');
const SetTrap = require('./set.js');
const HasTrap = require('./has.js');
const OwnKeysTrap = require('./ownKeys.js');
const DeletePropertyTrap = require('./deleteProperty.js');
const GetDescriptorTrap = require('./getDescriptor.js');

module.exports = {
    /**
     * @method createTraps
     * @description Assembling the fragmented angels into a unified guardian.
     */
    createTraps: (state, target) => {
        return {
            get: (tgt, prop, receiver) => GetTrap.handle(state, tgt, prop, receiver),
            set: (tgt, prop, value, receiver) => SetTrap.handle(state, tgt, prop, value, receiver),
            has: (tgt, prop) => HasTrap.handle(state, tgt, prop),
            ownKeys: (tgt) => OwnKeysTrap.handle(state, tgt),
            deleteProperty: (tgt, prop) => DeletePropertyTrap.handle(state, tgt, prop),
            getOwnPropertyDescriptor: (tgt, prop) => GetDescriptorTrap.handle(state, tgt, prop)
        };
    }
};
