// B"H
/**
 * MailboxRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createMailboxRuntime(){ const mail=[]; return { send(to,body){mail.push({to,body,at:Date.now(),read:false});return true;}, inbox(to){return mail.filter(m=>m.to===to);}, read(i){if(mail[i])mail[i].read=true;return mail[i]||null;} }; }
export function openMailbox(olam={}){ const owner=olam.player||olam.chossid||olam; owner.mail ||= [{ from:"Village Council", subject:"Welcome, shliach", body:"Help the village and collect your rewards.", read:false }]; const payload={ open:true, title:"Mailbox", inbox:owner.mail.map((m,index)=>({ index, ...m })) }; olam.ayshPeula?.("ui event","mailboxScreen",payload); return payload; }
export default createMailboxRuntime;
