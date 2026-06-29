// B"H
const fs=require('fs');function writeJson(path,obj){fs.writeFileSync(path,JSON.stringify(obj));return path;}function readJson(path){return JSON.parse(fs.readFileSync(path,'utf8'));}module.exports={writeJson,readJson};
