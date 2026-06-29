// B"H
/** Mailbox runtime with openMailbox compatibility. */
export function createMailboxRuntime(){ const mail=[]; return { send(to,body){mail.push({to,body,at:Date.now(),read:false});return true;}, inbox(to){return mail.filter(m=>m.to===to);}, read(i){if(mail[i])mail[i].read=true;return mail[i]||null;} }; }
<<<<<<< HEAD
export function openMailbox(olam={}){ const owner=olam.player||olam.chossid||olam; owner.mail ||= [{ from:"Village Council", subject:"Welcome, shliach", body:"Help the village and collect your rewards.", read:false }]; const payload={ open:true, title:"Mailbox", inbox:owner.mail.map((m,index)=>({ index, ...m })) }; olam.ayshPeula?.("ui event","mailboxScreen",payload); return payload; }
=======
export function openMailbox(owner='player', runtime=createMailboxRuntime()) { return { owner, inbox:runtime.inbox(owner) }; }
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
export default createMailboxRuntime;
