// B"H
export function isPhoneWindow() { return matchMedia?.('(max-width:720px),(pointer:coarse) and (max-width:900px)').matches; }
/** B"H: phone windows become sheets before they become broken rectangles. */
