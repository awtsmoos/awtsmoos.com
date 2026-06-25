// B"H
/** B"H — Chapter 933: The peer found a contract before a connection. */
function peerStateTemplate(payload = {}) {
  return { sessionId:payload.sessionId || "", role:payload.role || "offerer", state:"new", localFingerprint:payload.localFingerprint || "not-created", remoteFingerprint:payload.remoteFingerprint || "not-received", iceCount:0, heartbeatMs:Number(payload.heartbeatMs || 5000), dataChannels:["control-audit", "heartbeat"], media:["watch-frame-video-planned"] };
}
function browserPeerScript() {
  return `async function awtsCreateRemotePeer(){const pc=new RTCPeerConnection({iceServers:[]});const dc=pc.createDataChannel('heartbeat');const offer=await pc.createOffer();await pc.setLocalDescription(offer);return {type:offer.type,sdp:offer.sdp,fingerprint:(offer.sdp.match(/a=fingerprint:.*/)||['not-found'])[0]};}`;
}
function peerChecklist() { return ["create local offer", "send offer through remoteDesktopOffer", "store fingerprint", "apply answer", "send ICE candidates", "send heartbeat", "fail closed on revoke/pause"]; }
module.exports = { peerStateTemplate, browserPeerScript, peerChecklist };
