// B"H
/** @file MailboxRuntime.js @description Letter delivery service payloads. */
export function openMailbox(olam) { olam.__mail ||= [{ id: "rebbe_letter", title: "The Rebbe's First Mission" }]; const payload = { open: true, mail: olam.__mail }; olam?.ayshPeula?.("ui event", "mailbox", payload); return payload; }
export default { openMailbox };
