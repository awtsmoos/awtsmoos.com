// B"H
/** Region state: one small truth table that many systems can react to. */
export function regionalAwarenessState({timeOfDay='morning',weather='clear',danger=0,recentEvents=[],population=12}={}){
  const rain=weather==='rain'||weather==='storm';
  return {timeOfDay,weather,danger,recentEvents,population,rain,
    marketTraffic: rain?.35:Math.min(1,.25+population/40),
    guardAlert: Math.min(1,danger+.15*(weather==='storm')),
    animalCaution: Math.min(1,danger+.25*(rain||weather==='storm')),
    indoorBias: rain?.85:timeOfDay==='night'?.7:.2,
    rumorPressure: Math.min(1,recentEvents.length/6+danger*.4)};
}
export function regionalReactionHints(state){return{npcScheduleShift:state.indoorBias>0.6?'seek-shelter-or-home':'normal-route',animalPattern:state.animalCaution>.5?'cover-and-water':'graze-and-wander',lightingMood:state.weather==='storm'?'cool-heavy':state.timeOfDay==='evening'?'warm-gold':'clear-day',missionTone:state.rumorPressure>.4?'urgent-rumors':'ordinary-shlichus'}}
export default {regionalAwarenessState,regionalReactionHints};
