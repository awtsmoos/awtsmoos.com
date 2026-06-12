/**
 * B"H
 * Hyper-real style signature: visual-only personality and rhythm.
 */
export function emotionSignature(f,intent){return{panicSharpness:(intent.panic||0)*.9,hunterFocus:(intent.hunt||0),confidenceLift:(intent.confidence||0),recoverySearch:(intent.recover||0),diveCommit:(intent.dive||0)}}
