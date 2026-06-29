// B"H
const path=require('path');function tensorTemp(dir,label){return path.join(dir,label.replace(/[^a-z0-9_.-]/gi,'_')+'.f32');}function jsonTemp(dir,label){return path.join(dir,label.replace(/[^a-z0-9_.-]/gi,'_')+'.json');}module.exports={tensorTemp,jsonTemp};
