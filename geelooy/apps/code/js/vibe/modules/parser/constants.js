// B"H
/**
 * @file constants.js
 * @brief The Alphabet of Manifestation.
 * 
 * CHAPTER III: THE FRAGMENTED NAME
 * To name a thing is to limit it, but to split the name is to preserve its potential.
 * We define the markers of the beginning and the end as concatenated fragments,
 * ensuring the digital eye does not close prematurely.
 */

// B"H - Fragmenting the markers to prevent accidental self-parsing
const S_PART_1 = "₪₪₪_בס\"ד_תח" + "ילת_הק" + "וד_₪₪₪";
const E_PART_1 = "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪";

export const PR = {
    S: S_PART_1,
    E: E_PART_1,
    // Tag fragments for building dynamic XML detectors
    tO: "<" + "chan" + "ge>",
    tC: "</" + "chan" + "ge>",
    fO: "<" + "fi" + "le>",
    fC: "</" + "fi" + "le>",
    oO: "<" + "operat" + "ion>",
    oC: "</" + "operat" + "ion>",
    dO: "<" + "descrip" + "tion>",
    dC: "</" + "descrip" + "tion>",
    cO: "<" + "cont" + "ent>",
    cC: "</" + "cont" + "ent>"
};

export const MARKERS = {
    START: S_PART_1,
    END: E_PART_1,
    TAG_START: PR.tO,
    TAG_END: PR.tC,
    CONTENT_START: PR.cO,
    CONTENT_END: PR.cC,
    TAG_NAME: "chan" + "ge",
    FILE_NAME: "fi" + "le",
    OP_NAME: "operat" + "ion",
    DESC_NAME: "descrip" + "tion",
    CONTENT_NAME: "cont" + "ent"
};