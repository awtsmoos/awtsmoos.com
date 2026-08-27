// B"H
export class LeadRoomSolver{static offset(event={}){return /walk|follow|track|move/.test(`${event.action||''} ${event.shotIntent||''}`)?28:0;}}
