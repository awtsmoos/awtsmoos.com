// B"H
export function missionInterestScheduler(){const active=new Map();return{wake(m){active.set(m.id,m)},sleep(id){active.delete(id)},tick(){return[...active.values()].filter(m=>m.activeNearPlayer)},report(){return{active:active.size,ids:[...active.keys()]}}}}
export default missionInterestScheduler;
