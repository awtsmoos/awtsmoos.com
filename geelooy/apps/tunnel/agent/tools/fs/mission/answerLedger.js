// B"H

function cleanText(value) {
  return String(value || '').trim();
}

function questionId(input = {}, q = {}) {
  return cleanText(input.questionId || input.qid || input.gateQuestionId || q.id);
}

function idempotencyKey(input = {}, m = {}, qid = '', parsed = {}) {
  const explicit = cleanText(input.idempotencyKey || input.answerId || input.requestId);
  if (explicit) return explicit;
  return ['mission', m.id || '', 'question', qid || '', 'choice', parsed.key || ''].join(':');
}

function duplicate(m = {}, qid = '', key = '') {
  return (m.answers || []).find(answer => {
    return (key && answer.idempotencyKey === key) || (qid && answer.questionId === qid);
  }) || null;
}

function record(m = {}, q = {}, parsed = {}, input = {}) {
  const qid = questionId(input, q);
  const key = idempotencyKey(input, m, qid, parsed);
  const entry = {
    at: new Date().toISOString(),
    questionId: qid,
    idempotencyKey: key,
    ...parsed
  };
  m.answers ||= [];
  m.answers.push(entry);
  return entry;
}

/**
 * B"H
 * Chapter 547: The retry knocks twice, but the gate opens once.
 * Question identity is the thread; idempotency is the seal. The mission may
 * hear the same answer again through storm or echo, yet no second mutation may
 * crown itself as truth.
 */
function duplicatePayload(existing) {
  return {
    applied: false,
    duplicate: true,
    idempotent: true,
    didNotRecordAnswer: true,
    didNotApplySideEffects: true,
    originalAnswer: existing
  };
}

module.exports = { questionId, idempotencyKey, duplicate, record, duplicatePayload };
