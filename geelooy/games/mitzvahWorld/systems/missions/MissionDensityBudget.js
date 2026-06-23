// B"H
export function missionDensityBudget({fps=60,nearNpcs=0}={}){const cap=fps<55?2:fps<60?4:7;return{maxActiveNear:Math.max(1,cap-Math.floor(nearNpcs/12)),eventDriven:true,perFrameQuestScanning:false}}
export default missionDensityBudget;
