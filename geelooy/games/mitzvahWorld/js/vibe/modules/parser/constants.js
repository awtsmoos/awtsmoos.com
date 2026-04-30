
/**
 * B"H
 * @module Constants
 * @description
 * * Chapter 3: The Splitting of the Word
 * In the realm of Atziluth, the name and the essence are one. 
 * But in the lower worlds, we must speak in segments. 
 * By splitting the markers of the beginning and the end, we 
 * ensure the code remains a pure vessel, uncorrupted by 
 * the constraints of a single string.
 */

// B"H - Breaking the markers into separate emanations
// We use simple concatenation to form the true string "בס"ד" without backslashes.
const Q = '"';
const MARKER_S = "₪₪₪_בס" + Q + "ד_תחי" + "לת_הק" + "וד_₪₪₪";
const MARKER_E = "₪₪₪_בס" + Q + "ד_סו" + "ף_הק" + "וד_₪₪₪";

export const PR = {
    S: MARKER_S,
    E: MARKER_E,
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
    START: MARKER_S,
    END: MARKER_E,
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
