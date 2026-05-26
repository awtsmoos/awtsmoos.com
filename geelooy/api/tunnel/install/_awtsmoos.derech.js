// B"H
import fs from "fs";
import path from "path";
 
const root = process.cwd();
 
function readFile(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
 
export default async function handler(req, res) {
  const type = req.params?.type || "";
 
  if (type === "windows") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return readFile("geelooy/apps/tunnel/downloads/windows.ps1");
  }
 
  if (type === "linux") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return readFile("geelooy/apps/tunnel/downloads/linux.sh");
  }
 
  res.statusCode = 404;
  return 'B"H\nNot found';
}