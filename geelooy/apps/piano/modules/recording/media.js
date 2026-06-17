/* B"H
Media chunks are sparks: never hoard them in the king's chamber while the musician plays.
They are written to IndexedDB during the song, then gathered only when the song is over.
*/
import { AudioState } from '../audio.js';
import { recordingState } from './state.js';
import { downloadBlob } from './download.js';
import { finalizeVideoAudio } from './videoFinalize.js';
const DB='BH_PIANO_RECORDING_CHUNKS', STORE='chunks';
export async function startMediaRecorder(mode){
    const mimeType=MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/ogg';
    const session={id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,mode,mimeType,index:0};
    recordingState.mediaSession=session; recordingState.audioChunks=[]; recordingState.mediaWriteChain=Promise.resolve();
    await clearSession(session.id);
    recordingState.mediaRecorder=new MediaRecorder(AudioState.mediaStreamDestination.stream,{mimeType});
    recordingState.mediaRecorder.ondataavailable=e=>{ if(e.data?.size>0) queueChunk(session,e.data); };
    recordingState.mediaRecorder.onstop=()=>finishSession(session);
    recordingState.mediaRecorder.start(1000);
}
export function stopMediaRecorder(){ if(recordingState.mediaRecorder?.state!=='inactive') recordingState.mediaRecorder?.stop(); }
function queueChunk(session,blob){
    const row={sessionId:session.id,index:session.index++,blob,type:blob.type,size:blob.size};
    recordingState.mediaWriteChain=recordingState.mediaWriteChain.then(()=>putRow(row)).catch(console.warn);
}
async function finishSession(session){
    await recordingState.mediaWriteChain;
    const blobs=await readSession(session.id);
    const blob=new Blob(blobs,{type:session.mimeType});
    await clearSession(session.id);
    recordingState.mediaSession=null; recordingState.mediaRecorder=null; recordingState.audioChunks=[];
    if(session.mode==='audio') downloadBlob(blob,`BH-Audio-${Date.now()}.webm`);
    if(session.mode==='video') finalizeVideoAudio(blob);
}
function openDb(){
    return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1); r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:['sessionId','index']}); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);});
}
async function withStore(mode,fn){const db=await openDb(); return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode); const store=tx.objectStore(STORE); const out=fn(store); tx.oncomplete=()=>{db.close(); resolve(out);}; tx.onerror=()=>{db.close(); reject(tx.error);};});}
function putRow(row){return withStore('readwrite',s=>s.put(row));}
function clearSession(sessionId){return withStore('readwrite',s=>{const range=IDBKeyRange.bound([sessionId,0],[sessionId,Number.MAX_SAFE_INTEGER]); s.delete(range);});}
async function readSession(sessionId){
    const rows=[]; await withStore('readonly',s=>{const range=IDBKeyRange.bound([sessionId,0],[sessionId,Number.MAX_SAFE_INTEGER]); const req=s.openCursor(range); req.onsuccess=()=>{const c=req.result; if(c){rows.push(c.value); c.continue();}};});
    return rows.sort((a,b)=>a.index-b.index).map(r=>r.blob);
}
