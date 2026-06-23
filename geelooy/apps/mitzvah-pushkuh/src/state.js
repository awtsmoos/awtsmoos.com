// B"H
// The ledger remembers sparks without pretending a local demo is a backend.
const KEY = "awtsmoos.mitzvahPushkuh.entries.v3";
export const templates=["Learn Torah for 10 minutes","Give tzedakah before sunset","Call someone who needs chizuk","Say Tehillim for another Yid","Guard my speech for one hour","Do one hidden chesed","Forgive one small hurt","Help at home without being asked"];
export function loadEntries(){try{return JSON.parse(localStorage.getItem(KEY)||"[]").map(normalize)}catch{return[]}}
export function saveEntries(entries){localStorage.setItem(KEY,JSON.stringify(entries))}
export function makeEntry(form){const now=new Date();const clean=v=>String(v||"").trim();const entry={id:crypto.randomUUID?.()||`spark-${now.getTime()}`,title:clean(form.title),type:clean(form.type),note:clean(form.note),status:clean(form.status)||"Accepted",visibility:clean(form.visibility)||"Private",intensity:Number(form.intensity||3),createdAt:now.toISOString(),deadlineAt:deadline(form.deadline,now),fulfilledAt:null};return normalize(entry)}
export function demoEntries(){return[normalize({id:"welcome-light",demo:true,title:"Drag a spark into the vessel",type:"Personal Growth",note:"Create a hachlata, choose a time limit, then drop it into the living pushkuh.",status:"Accepted",visibility:"Private",intensity:3,createdAt:new Date().toISOString(),deadlineAt:null})]}
export function stats(entries){const real=entries.filter(e=>!e.demo);return{total:real.length,fulfilled:real.filter(e=>e.status==="Fulfilled").length,active:real.filter(e=>isActive(e)).length,publicCount:real.filter(e=>e.profileVisible).length,level:Math.max(1,Math.floor(real.reduce((s,e)=>s+e.intensity,0)/8)+1)}}
export function updateEntry(entries,id,patch){return entries.map(e=>e.id===id?normalize({...e,...patch}):e)}
export function removeEntry(entries,id){return entries.filter(e=>e.id!==id)}
export function relightEntry(entry){return makeEntry({...entry,title:`Relight: ${entry.title}`,status:"Accepted",deadline:"none"})}
export function archiveFilter(entries,filter){const real=entries.filter(e=>!e.demo);if(filter==="active")return real.filter(isActive);if(filter==="fulfilled")return real.filter(e=>e.status==="Fulfilled");if(filter==="overdue")return real.filter(e=>e.deadlineAt);return real}
export function timeLabel(entry){if(entry.status==="Fulfilled")return entry.fulfilledAt?`Fulfilled ${shortDate(entry.fulfilledAt)}`:"Fulfilled";if(!entry.deadlineAt)return"No time limit";const ms=new Date(entry.deadlineAt)-new Date();if(ms<0)return"Overdue, waiting for return";const mins=Math.ceil(ms/60000);if(mins<90)return`${mins} min left`;const hours=Math.ceil(mins/60);if(hours<36)return`${hours} hr left`;return`${Math.ceil(hours/24)} days left`}
export function isOverdue(entry){return entry.deadlineAt&&entry.status!=="Fulfilled"&&new Date(entry.deadlineAt)<new Date()}
function normalize(entry){const e={...entry};e.profileVisible=e.visibility!=="Private";e.socialDraft=e.profileVisible?{kind:"mitzvah-hachlata",title:e.title,category:e.type,body:e.note,status:e.status,audience:e.visibility,intensity:e.intensity,createdAt:e.createdAt}:null;return e}
function isActive(e){return e.status!=="Fulfilled"&&!isOverdue(e)}
function deadline(kind,now){const d=new Date(now);if(kind==="18m")d.setMinutes(d.getMinutes()+18);else if(kind==="1h")d.setHours(d.getHours()+1);else if(kind==="today")d.setHours(23,59,59,999);else if(kind==="3d")d.setDate(d.getDate()+3);else if(kind==="7d")d.setDate(d.getDate()+7);else return null;return d.toISOString()}
function shortDate(iso){return new Date(iso).toLocaleString([],{dateStyle:"medium",timeStyle:"short"})}
