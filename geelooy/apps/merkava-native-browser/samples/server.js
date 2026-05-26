// B"H
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const types = { ".html": "text/html", ".js": "text/javascript" };

http.createServer((req, res) => {
  const name = req.url === "/" ? "frontend.html" : req.url.replace(/^\//, "");
  const file = path.join(root, name);
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); res.end("missing"); return; }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "text/plain" });
  res.end(fs.readFileSync(file));
}).listen(Number(process.env.PORT || 8765), () => {
  console.log('B"H sample server on http://127.0.0.1:' + (process.env.PORT || 8765));
});
