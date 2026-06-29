// B"H
const Plan = require('../../../lib/remoteNativeDesktop/protocolPlan.js');
const Scene = require('../../../lib/remoteNativeDesktop/scene/geelooyScene.js');
const Render = require('../../../lib/remoteNativeDesktop/sceneToFramebuffer.js');
const Pointer = require('../../../lib/remoteNativeDesktop/input/pointer.js');
const Keyboard = require('../../../lib/remoteNativeDesktop/input/keyboard.js');
const Rfb = require('../../../lib/remoteNativeDesktop/rfb/server.js');
function buildRemoteNativeDesktopActions(ctx) { const { payload = {} } = ctx; return {
  async remoteNativeDesktopPlan() { return { ok:true, action:'remoteNativeDesktopPlan', plan:Plan.PLAN }; },
  async remoteNativeDesktopProtocols() { return { ok:true, action:'remoteNativeDesktopProtocols', recommended:'RFB/VNC first', protocols:Plan.PLAN.protocols }; },
  async remoteNativeDesktopAuthPlan() { return { ok:true, action:'remoteNativeDesktopAuthPlan', auth:Plan.PLAN.auth, requestedUser:payload.user || payload.username || '' }; },
  async remoteNativeDesktopSampleScene() { return { ok:true, action:'remoteNativeDesktopSampleScene', scene:Scene.sample() }; },
  async remoteNativeDesktopRenderScene() { const rendered = Render.render(payload.scene || payload); return { ok:true, action:'remoteNativeDesktopRenderScene', width:rendered.framebuffer.width, height:rendered.framebuffer.height, bytes:rendered.framebuffer.pixels.length, damage:rendered.damage, note:rendered.note }; },
  async remoteNativeDesktopPointer() { return { ok:true, action:'remoteNativeDesktopPointer', virtualAction:Pointer.pointerToAction(payload) }; },
  async remoteNativeDesktopKeyboard() { return { ok:true, action:'remoteNativeDesktopKeyboard', virtualAction:Keyboard.keyToAction(payload) }; },
  async remoteNativeDesktopRfbStart() { return { ok:true, action:'remoteNativeDesktopRfbStart', rfb:Rfb.start(payload), security:'localhost-only; expose remotely only through scoped preview/proxy' }; },
  async remoteNativeDesktopRfbStop() { return { ok:true, action:'remoteNativeDesktopRfbStop', rfb:Rfb.stop(payload.id) }; },
  async remoteNativeDesktopRfbStatus() { return { ok:true, action:'remoteNativeDesktopRfbStatus', rfb:Rfb.status(payload.id) }; },
  async remoteNativeDesktopRfbSetScene() { return { ok:true, action:'remoteNativeDesktopRfbSetScene', rfb:Rfb.setScene(payload.id, payload.scene || payload) }; }
};}
/** B"H: A localhost VNC/RFB fake Geelooy computer can now speak pixels. */
module.exports = { buildRemoteNativeDesktopActions };
