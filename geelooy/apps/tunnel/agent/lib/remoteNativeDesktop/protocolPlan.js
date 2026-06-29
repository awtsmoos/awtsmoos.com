// B"H
const PLAN = Object.freeze({
  goal:'Let ordinary remote desktop clients see a totally fake Geelooy computer.',
  protocols:['RFB/VNC first because it is simpler than RDP', 'RDP later with a C or Node native bridge', 'SPICE/WebRTC optional for browser-first sessions'],
  nodePath:['TCP listener', 'RFB handshake/security', 'framebuffer encoder', 'input decoder', 'Geelooy scene renderer', 'damage rectangles', 'clipboard channel'],
  renderer:'Use pure JS canvas/headless framebuffer first. Each Geelooy window becomes a scene node painted into RGBA buffers.',
  input:'Pointer and keyboard events are translated into Geelooy OS DOM-like commands: focus, click, type, drag, open app.',
  fakeHardware:['virtual monitor', 'virtual mouse', 'virtual keyboard', 'virtual disk drives', 'virtual network status'],
  auth:'Use Awtsmoos account session/OAuth or account password verifier. Never store raw passwords in the remote desktop daemon.',
  cPath:'If performance demands it, compile C helpers for pixel diff, rectangle copy, zlib/tight encoding, and cursor composition.',
  safety:'Remote desktop control is owner-authenticated by default; public sharing requires scoped, expiring, revocable capability URLs.'
});
module.exports = { PLAN };
