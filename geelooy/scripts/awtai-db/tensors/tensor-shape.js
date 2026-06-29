// B"H
function elements(t){return t.dims.reduce((a,b)=>a*b,1);}function rowsCols(t){return{cols:t.dims[0],rows:t.dims[1]||1};}module.exports={elements,rowsCols};
