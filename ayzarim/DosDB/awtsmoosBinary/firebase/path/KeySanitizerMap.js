
// B"H
/**
 * @file KeySanitizerMap.js
 * @description
 * Just as the Hebrew letters undergo permutations—At-Bash, Albam—to manifest different realities,
 * our local keys must be permuted to exist safely in Firebase. Firebase bans `. $ # [ ] /`.
 * We hold these substitutions in a pure data map.
 */

const SanitizerReplacements = {
    '.': '_dot_',
    '$': '_dollar_',
    '#': '_hash_',
    '[': '_lbracket_',
    ']': '_rbracket_',
    '/': '_slash_'
};

const ReverseSanitizerReplacements = {};
for (const [forbidden, safe] of Object.entries(SanitizerReplacements)) {
    ReverseSanitizerReplacements[safe] = forbidden;
}

module.exports = {
    SanitizerReplacements,
    ReverseSanitizerReplacements
};
