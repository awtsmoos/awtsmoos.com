// B"H
export function createFrameBudgetLedger(targetMs=16.67){const buckets=new Map();return{targetMs,add(name,ms){const b=buckets.get(name)||{calls:0,total:0,max:0};b.calls++;b.total+=ms;b.max=Math.max(b.max,ms);buckets.set(name,b)},report(){return{targetMs,buckets:Object.fromEntries([...buckets].map(([k,v])=>[k,{...v,avg:v.total/Math.max(1,v.calls)}]))}},reset(){buckets.clear()}}}
export default createFrameBudgetLedger;
