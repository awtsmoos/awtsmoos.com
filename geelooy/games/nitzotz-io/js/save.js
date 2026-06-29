// B'H
const KEY='nitzotz-worlds-save';
export function loadSave(){try{return Object.assign(defaults(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return defaults()}}
export function saveGame(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
export function defaults(){return{best:0,completed:[],perf:'medium',haptics:true,postfx:false,uiScale:1}}
export function objectBudget(perf){return perf==='low'?24:perf==='high'?54:38}
