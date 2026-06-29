// B"H
/** Mailbox runtime with openMailbox compatibility. */
export function createMailboxRuntime() {
  const mail = [];
  return {
    send(to, body) { mail.push({ to, body, at:Date.now(), read:false }); return true; },
    inbox(to) { return mail.filter(m => m.to === to); },
    read(index) { if (mail[index]) mail[index].read = true; return mail[index] || null; }
  };
}

export function openMailbox(target = {}) {
  if (typeof target === "string") return { owner:target, inbox:[] };
  const owner = target.player || target.chossid || target;
  owner.mail ||= [{ from:"Village Council", subject:"Welcome, shliach", body:"Help the village and collect your rewards.", read:false }];
  const payload = { open:true, title:"Mailbox", owner:owner.id || "player", inbox:owner.mail.map((m, index) => ({ index, ...m })) };
  target.ayshPeula?.("ui event", "mailboxScreen", payload);
  return payload;
}

export default createMailboxRuntime;
