// B'H
export const CHUNK=420;
export function chunkKey(x,y){return Math.floor(x/CHUNK)+','+Math.floor(y/CHUNK)}
export function chunkCenter(key){const [x,y]=key.split(',').map(Number);return{x:(x+.5)*CHUNK,y:(y+.5)*CHUNK}}
export function nearbyChunks(x,y,r=2){const cx=Math.floor(x/CHUNK),cy=Math.floor(y/CHUNK),out=[];for(let iy=-r;iy<=r;iy++)for(let ix=-r;ix<=r;ix++)out.push((cx+ix)+','+(cy+iy));return out}
export function hashKey(key,seed=0){let h=2166136261^seed;for(let i=0;i<key.length;i++){h^=key.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
