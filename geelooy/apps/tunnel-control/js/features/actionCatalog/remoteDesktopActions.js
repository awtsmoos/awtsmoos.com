// B"H
import { action } from './action.js';

/** B"H: remote desktop actions press pixels into a temporary garment. */
export const REMOTE_DESKTOP_ACTIONS = Object.freeze([
  action('remoteNativeDesktopPlan', 'Fake desktop plan', 'Show fake Geelooy computer architecture.', 'Remote Desktop', ['vnc','plan'], {}),
  action('remoteNativeDesktopRenderScene', 'Render fake desktop', 'Render a Geelooy scene into framebuffer metadata.', 'Remote Desktop', ['vnc','pixels'], { scene:{ title:'Geelooy OS' } }),
  action('remoteNativeDesktopRfbStart', 'Start fake VNC', 'Start localhost-only RFB/VNC fake Geelooy desktop.', 'Remote Desktop', ['vnc','localhost'], { port:5905 }),
  action('remoteNativeDesktopRfbStatus', 'Fake VNC status', 'Show running localhost fake VNC servers.', 'Remote Desktop', ['vnc','status'], {}),
  action('remoteNativeDesktopRfbStop', 'Stop fake VNC', 'Stop a fake VNC server.', 'Remote Desktop', ['vnc'], { id:'geelooy-rfb' }),
  action('remoteNativeDesktopPointer', 'Fake desktop pointer', 'Translate pointer event into virtual OS action.', 'Remote Desktop', ['input'], { x:0, y:0, buttons:0 }),
  action('remoteNativeDesktopKeyboard', 'Fake desktop keyboard', 'Translate key event into virtual OS action.', 'Remote Desktop', ['input'], { key:'A' })
]);
