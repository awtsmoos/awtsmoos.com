// B"H
function align(value, boundary){ const r=value%boundary; return r?value+boundary-r:value; }
module.exports={align};
