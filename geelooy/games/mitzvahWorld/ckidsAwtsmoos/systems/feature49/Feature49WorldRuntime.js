// B"H
/** WorldRuntime: hidden stories, projects, emergencies, cleanliness, archive. */
import { mutateFeature49State, appendFeature49Log } from './Feature49State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function advanceCommunityProject(id='study_house_renovation', amount=1){ return mutateFeature49State(s=>{ s.projects ||= {}; s.projects[id]=(s.projects[id]||0)+amount; appendFeature49Log({type:'project',id,amount}); return s; }); }
export function revealObservationStory(id='quiet_kindness', text='You noticed kindness nobody announced.'){ return mutateFeature49State(s=>{ s.observationStories ||= {}; s.observationStories[id]={text,seenAt:Date.now()}; return s; }); }
export function setCleanliness(zone='village_square', value=50){ return mutateFeature49State(s=>{ s.cleanliness ||= {}; s.cleanliness[zone]=Math.max(0,Math.min(100,value)); return s; }); }
export function triggerCommunityEmergency(id='lost_child', roles=['guardian','helper','learner']){ return mutateFeature49State(s=>{ s.emergencies ||= []; s.emergencies.unshift({id,roles,status:'active',at:Date.now()}); s.emergencies=s.emergencies.slice(0,12); return s; }); }
export function archiveAccomplishment(title, detail={}){ return mutateFeature49State(s=>{ s.archive ||= []; s.archive.push({title,detail,at:Date.now()}); s.archive=s.archive.slice(-120); return s; }); }
export function renovateBuilding(id='village_inn', stage=1){ return mutateFeature49State(s=>{ s.renovations ||= {}; s.renovations[id]=Math.max(s.renovations[id]||0,stage); return s; }); }
export function evolveCivilization(axis='education', amount=1){ return mutateFeature49State(s=>{ s.civilization ||= {}; s.civilization[axis]=(s.civilization[axis]||0)+amount; return s; }); }
export default { advanceCommunityProject, revealObservationStory, setCleanliness, triggerCommunityEmergency, archiveAccomplishment, renovateBuilding, evolveCivilization };
