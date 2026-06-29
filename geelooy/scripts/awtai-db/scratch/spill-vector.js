// B"H
const {FloatFile}=require('./float-file.js');
function spillVector(file,array){const f=new FloatFile(file,array.length);f.write(array);f.close();return file;}function loadVector(file,length){const f=new FloatFile(file,length);const v=f.read(0,length);f.close();return v;}module.exports={spillVector,loadVector};
