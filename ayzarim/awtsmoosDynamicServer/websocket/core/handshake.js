
// B"H
const crypto = require("crypto");

const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

function acceptDigest(key) {
  return crypto.createHash("sha1").update(key + GUID).digest("base64");
}

function writeHandshake(req, socket) {
  const key = req.headers["sec-websocket-key"];

  if (!key) {
    socket.destroy();
    return false;
  }

  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptDigest(key)}`,
    "\r\n"
  ].join("\r\n"));

  return true;
}

module.exports = { writeHandshake, acceptDigest };
