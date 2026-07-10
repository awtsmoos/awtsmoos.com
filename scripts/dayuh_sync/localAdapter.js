// B"H
const fs = require('fs');
const path = require('path');
function ensureDir(file) { fs.mkdirSync(path.dirname(file), { recursive:true }); }
class LocalAdapter {
  constructor(root) { this.root = path.resolve(root); }
  resolve(relative) { return path.join(this.root, relative); }
  async readJson(relative) {
    try { return JSON.parse(fs.readFileSync(this.resolve(relative), 'utf8')); }
    catch { return null; }
  }
  async writeJson(relative, value) {
    const file=this.resolve(relative); ensureDir(file); fs.writeFileSync(file, JSON.stringify(value,null,2));
  }
  async upload(localFile, relative) {
    const target=this.resolve(relative), temp=`${target}.awtsmoos-part`; ensureDir(target); fs.copyFileSync(localFile,temp); fs.renameSync(temp,target);
  }
  async download(relative, localFile) {
    const temp=`${localFile}.awtsmoos-part`; ensureDir(localFile); fs.copyFileSync(this.resolve(relative),temp); fs.renameSync(temp,localFile);
  }
  async remove(relative) { fs.rmSync(this.resolve(relative), { force:true, recursive:true }); }
  async close() {}
}
module.exports = { LocalAdapter };
