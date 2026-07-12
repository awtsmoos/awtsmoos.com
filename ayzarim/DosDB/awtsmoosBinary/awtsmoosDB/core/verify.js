// B"H

/**
 * @file core/verify.js
 * @chapter The Gate That Refuses To Guess
 * @description
 * Compatibility doorway for the modular verifier. The public require path stays
 * unchanged while the range ledger, token decoders, and structure walkers live
 * in smaller vessels that can each be tested without hiding corruption.
 */

module.exports = require('./verifier/index.js');
