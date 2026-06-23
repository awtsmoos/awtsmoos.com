// B"H
export function createWorldGenerationQueue({budgetMs=4,now=()=>performance.now()}={}){const q=[];return{push(job){q.push({...job,priority:job.priority??50});q.sort((a,b)=>a.priority-b.priority);return job},tick(){const start=now();let ran=0;while(q.length&&now()-start<budgetMs){q.shift().run?.();ran++}return{ran,remaining:q.length,budgetMs}},report(){return{queued:q.length,next:q.slice(0,8).map(j=>({name:j.name,priority:j.priority}))}}}}
export default createWorldGenerationQueue;
