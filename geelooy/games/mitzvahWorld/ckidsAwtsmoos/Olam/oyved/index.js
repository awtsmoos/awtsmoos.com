// B"H
/** Worker shell with active tested worker entrypoint import. */
import { startOyvedEntrypoint } from "./core/entry/WorkerEntrypoint.js?compact=true&v=actual-tested-live-gates-20260709-bh5";
const BH='B"H', ENTRY_SEAL="actual-tested-live-gates-20260709-bh5";
function textOf(value){return String(value);}
function errorMessage(error){return error&&error.message?error.message:String(error);}
function shellPost(type,text){try{self.postMessage({type,text:textOf(text),message:textOf(text),details:textOf(text),errorText:textOf(text)});}catch(error){console.error(BH+" | OYVED_SHELL | failed to post text | reason="+errorMessage(error));}}
function shellErrorText(error){if(error instanceof Error)return[error.name+": "+error.message,"stack="+String(error.stack||"no stack").replace(/\s+/g," ")].join(" || ");return String(error);}
shellPost("worker_text_log","OYVED_SHELL loaded || seal="+ENTRY_SEAL);
self.addEventListener("error",event=>{const text=["OYVED_SHELL runtime error","message="+(event.message||"unknown"),"filename="+(event.filename||"unknown"),"line="+(event.lineno||0),"column="+(event.colno||0)].join(" || ");console.error(BH+" | "+text);shellPost("ERROR_TEXT",text);});
self.addEventListener("unhandledrejection",event=>{const text=["OYVED_SHELL unhandled rejection",shellErrorText(event.reason)].join(" || ");console.error(BH+" | "+text);shellPost("ERROR_TEXT",text);});
try{if(typeof startOyvedEntrypoint!=="function")throw new Error("WorkerEntrypoint.js loaded but did not export startOyvedEntrypoint");shellPost("worker_text_log","OYVED_SHELL imported WorkerEntrypoint.js || seal="+ENTRY_SEAL);startOyvedEntrypoint();}catch(error){const text=["OYVED_SHELL failed to start WorkerEntrypoint.js",shellErrorText(error),"repoOnlyFix=create exact missing module or fix import/export"].join(" || ");console.error(BH+" | "+text);self.postMessage({type:"ERROR",isImportError:true,message:text,details:text,errorText:text});}
