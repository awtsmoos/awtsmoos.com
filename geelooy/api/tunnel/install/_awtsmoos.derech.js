// B"H
const fs = require("fs");
const path = require("path");
 
module.exports = async function $awtsmoos(req, res) {
  try {
    const type = req.params?.type || req.path?.split("/").pop();
 
    const file =
      type === "windows"
        ? "geelooy/apps/tunnel/downloads/windows.ps1"
        : type === "linux"
          ? "geelooy/apps/tunnel/downloads/linux.sh"
          : null;
 
    if (!file) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end('B"H\nNot found');
    }
 
    const text = fs.readFileSync(path.join(process.cwd(), file), "utf8");
 
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(text);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end('B"H\n' + String(e?.stack || e));
  }
};