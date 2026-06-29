// B"H
function matvecRows(weight, rows, cols, x){
  const y=new Float32Array(rows);
  for(let r=0;r<rows;r++){
    let sum=0, base=r*cols;
    for(let c=0;c<cols;c++) sum+=weight[base+c]*x[c];
    y[r]=sum;
  }
  return y;
}
module.exports={matvecRows};
