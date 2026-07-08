// B"H
/** @file IconUiHelpers.js @description Tiny helpers compress UI words into icons, chips, meters, and locks. */
import { iconNode } from "./IconCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function iconStat(key,value,delta=0){ return { ...iconNode(key,value,delta>0?"up":delta<0?"down":"same"), delta }; }
export function iconAction(key,enabled=false,reason=""){ return { ...iconNode(key,null,enabled?"ready":"disabled"), enabled, reason }; }
export function iconLock(ok=true,missing=[]){ return { ...iconNode(ok?"owned":"locked",missing.length||null,ok?"open":"locked"), ok, missing }; }
export function iconTabs(keys=[]){ return keys.map(key=>iconNode(String(key).toLowerCase().replace(/s$/,""),key,"tab")); }
export default { iconStat, iconAction, iconLock, iconTabs };
