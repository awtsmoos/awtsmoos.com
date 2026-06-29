/* B"H
HLS state: Yesod gathers frame count, segments, errors, and uploaded bytes.
*/
export function createHlsState({ sessionId, targetDuration }) { return { sessionId, targetDuration, frameIndex:0, segmentIndex:0, stopped:false, pumping:false, uploaded:0, pieces:[], pending:[], errors:[] }; }
export function healthFromHlsState(state, label = 'Running') { return { state:label, session:state.sessionId, frames:state.frameIndex, segments:state.pieces.length, uploaded:state.uploaded, errors:state.errors.length }; }
