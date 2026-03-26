
// B"H
/**
 * @file constants.js
 * @brief The Shattered Letters of Manifestation.
 */

const S = "₪₪₪_בס\"ד_תחי" + "לת_הק" + "וד_₪₪₪";
const E = "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪";

export const PR = {
    S: S,
    E: E,
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
    START: S,
    END: E,
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
