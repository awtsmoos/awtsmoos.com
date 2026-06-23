// B"H
import { interestRing } from './InterestRings.js';
export function createGameplayBudgetScheduler({now=()=>performance.now(),player=()=>({x:0,z:0})}={}){const tasks=[];return{add(task){tasks.push({...task,last:0});return task},tick(time=now()){let ran=0;for(const task of tasks){const ring=interestRing(task.position?.()||{},player());const hz=task.hz??ring.hz;if(!hz)continue;const every=1000/Math.max(.001,hz);if(time-task.last>=every){task.last=time;task.run?.(ring);ran++}}return ran},report(){return{tasks:tasks.length,names:tasks.map(t=>t.name)}}}}
export default createGameplayBudgetScheduler;
