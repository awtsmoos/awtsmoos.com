// B"H
/**
 * GameplayBudgetScheduler: due tasks are not a stampede.
 * The scheduler carries debt across frames and caps work per tick.
 */
import { interestRing } from './InterestRings.js';
export function createGameplayBudgetScheduler({now=()=>performance.now(),player=()=>({x:0,z:0}),maxTasksPerTick=3,maxMsPerTick=1.8}={}){const tasks=[];let cursor=0;function budget(){return globalThis.__AWTSMOOS_GAMEPLAY_BUDGET__||globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__||{};}return{add(task){const row={...task,last:0,debt:0};tasks.push(row);return row;},tick(time=now()){const start=now();let ran=0;const b=budget();const cap=Math.max(1,Math.min(maxTasksPerTick,Number(b.maxTasksPerTick||maxTasksPerTick)));for(let scanned=0;scanned<tasks.length&&ran<cap;scanned++){const task=tasks[cursor%Math.max(1,tasks.length)];cursor+=1;if(!task)continue;const ring=interestRing(task.position?.()||{},player());const hz=task.hz??ring.hz;if(!hz)continue;const every=1000/Math.max(.001,hz);if(time-task.last<every)continue;if(now()-start>maxMsPerTick){task.debt+=1;break;}task.last=time;task.debt=0;task.run?.(ring,b);ran++;}return ran;},report(){return{tasks:tasks.length,cursor,names:tasks.map(t=>t.name),seal:'capped-gameplay-budget-scheduler-20260623-bh5'}}};}
export default createGameplayBudgetScheduler;