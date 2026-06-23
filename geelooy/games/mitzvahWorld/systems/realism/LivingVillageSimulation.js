// B"H
const SCHEDULE={morning:'school-or-market',noon:'work-and-trade',evening:'home-and-study',night:'home'};
export function villagerState({name='villager',home='home',work='market',timeOfDay='morning',weather='clear',relationship=0}={}){const raining=weather==='rain'||weather==='storm';const destination=raining&&timeOfDay!=='noon'?home:SCHEDULE[timeOfDay]==='home'?home:work;return{name,home,work,destination,activity:raining?'shelter':SCHEDULE[timeOfDay]||'daily-life',greeting:relationship>.7?'warm-shalom':'shalom',updateHz:destination===home?1:4}}
export function villageSnapshot(villagers=[],context={}){return{count:villagers.length,states:villagers.map(v=>villagerState({...v,...context})),simulation:'schedule-and-weather-driven'}}
export default {villagerState,villageSnapshot};
