// B"H
/** @file ServicePanelUI.js @description Pure view-models for mailbox, bank, delivery, lock, and tutorial payloads. */
export function mailboxView(payload = {}) { return { type:"MailboxUI", open:payload.open === true, mail:Array.isArray(payload.mail) ? payload.mail : [] }; }
export function bankView(payload = {}) { return { type:"BankUI", open:payload.open === true, slots:payload.bank?.slots || [] }; }
export function deliveryView(payload = {}) { return { type:"DeliveryUI", ok:Boolean(payload.ok), delivered:payload.delivered || [], blocked:payload.blocked || [] }; }
export function lockStateView(payload = {}) { return { type:"LockStateUI", lockId:payload.lockId || null, state:payload.state || "unknown", locked:Boolean(payload.locked), text:payload.text || "" }; }
export function tutorialHintView(payload = {}) { return { type:"TutorialHintUI", id:payload.id || null, hint:payload.hint || "" }; }
export default { mailboxView, bankView, deliveryView, lockStateView, tutorialHintView };
