// B"H
export function installLongTaskReporter(scope=globalThis){const events=[];try{const observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>events.push({name:e.name,duration:e.duration,startTime:e.startTime})));observer.observe({entryTypes:['longtask']});scope.__AWTSMOOS_LONG_TASK_REPORTER__={events,observer,report:()=>({count:events.length,events:events.slice(-20)})};return scope.__AWTSMOOS_LONG_TASK_REPORTER__}catch{return{events,report:()=>({count:0,events:[],unsupported:true})}}}
export default installLongTaskReporter;
