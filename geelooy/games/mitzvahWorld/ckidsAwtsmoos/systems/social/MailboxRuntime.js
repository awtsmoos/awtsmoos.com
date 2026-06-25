// B"H
/** Mailbox runtime with openMailbox compatibility. */
export function createMailboxRuntime(){ const mail=[]; return { send(to,body){mail.push({to,body,at:Date.now(),read:false});return true;}, inbox(to){return mail.filter(m=>m.to===to);}, read(i){if(mail[i])mail[i].read=true;return mail[i]||null;} }; }
export function openMailbox(owner='player', runtime=createMailboxRuntime()) { return { owner, inbox:runtime.inbox(owner) }; }
export default createMailboxRuntime;
