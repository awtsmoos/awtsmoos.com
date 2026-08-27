// B"H
const net = require('net');
const Scene = require('../scene/geelooyScene.js');
const Painter = require('../scene/painter.js');
const Raw = require('./rawEncoder.js');
const servers = new Map();
function start(input = {}) {
  const id = input.id || 'geelooy-rfb'; if (servers.has(id)) return status(id);
  const host = input.host || '127.0.0.1', port = Number(input.port || 5905);
  const scene = Scene.normalize(input.scene || Scene.sample());
  const state = { id, host, port, scene, clients:0, startedAt:new Date().toISOString() };
  const server = net.createServer(sock => handle(sock, state));
  server.listen(port, host); state.server = server; servers.set(id, state); return status(id);
}
function stop(id = 'geelooy-rfb') { const s = servers.get(id); if (!s) return { ok:true, id, stopped:false }; s.server.close(); servers.delete(id); return { ok:true, id, stopped:true }; }
function status(id = '') { const xs = id ? [servers.get(id)].filter(Boolean) : [...servers.values()]; return { ok:true, action:'remoteNativeDesktopRfbStatus', servers:xs.map(s => ({ id:s.id, host:s.host, port:s.port, clients:s.clients, startedAt:s.startedAt, vncUrl:`vnc://${s.host}:${s.port}` })) }; }
function handle(sock, state) { state.clients++; let stage = 0; sock.write('RFB 003.008\n'); sock.on('data', data => { try { stage = step(sock, state, stage, data); } catch { sock.destroy(); } }); sock.on('close', () => { state.clients = Math.max(0, state.clients - 1); }); }
function step(sock, state, stage, data) {
  if (stage === 0) { sock.write(Buffer.from([1, 1])); return 1; }
  if (stage === 1) { sock.write(Buffer.from([0, 0, 0, 0])); sendServerInit(sock, state); return 2; }
  for (let i = 0; i < data.length; i++) if (data[i] === 3) sendFrame(sock, state);
  return 2;
}
function sendServerInit(sock, state) { const fb = Painter.paint(state.scene).framebuffer, name = Buffer.from('Awtsmoos Geelooy Fake Computer'); const h = Buffer.alloc(24); h.writeUInt16BE(fb.width, 0); h.writeUInt16BE(fb.height, 2); h[4]=32; h[5]=24; h[6]=0; h[7]=1; h.writeUInt16BE(255,8); h.writeUInt16BE(255,10); h.writeUInt16BE(255,12); h[14]=16; h[15]=8; h[16]=0; h.writeUInt32BE(name.length,20); sock.write(Buffer.concat([h,name])); }
function sendFrame(sock, state) { const fb = Painter.paint(state.scene).framebuffer; sock.write(Raw.update(fb)); }
function setScene(id, scene) { const s = servers.get(id || 'geelooy-rfb'); if (!s) return { ok:false, error:'rfb_server_not_running' }; s.scene = Scene.normalize(scene || {}); return status(s.id); }
module.exports = { start, stop, status, setScene };
