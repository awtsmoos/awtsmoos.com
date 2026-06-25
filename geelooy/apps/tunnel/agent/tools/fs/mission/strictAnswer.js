// B"H

const ANSWER_ALIASES = [
  'multipleChoiceAnswer',
  'answer',
  'choice',
  'selectedChoice',
  'response',
  'text',
  'message'
];

function answerInputText(input = {}) {
  for (const key of ANSWER_ALIASES) {
    const value = input?.[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'object') {
      const nested = answerInputText(value);
      if (nested) return nested;
      continue;
    }
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

function strictMode(q = {}) {
  return q.answerMode === 'single_letter_choice' || q.strictAnswer === true;
}

function choiceByKey(q, key) {
  return (q.choices || []).find(c => c.key === key) || null;
}

/**
 * B"H
 * Chapter 545: The answer-gate became a narrow bridge.
 * The label may sing, the report may thunder, but the payload bows to one
 * exact letter. Prose is not a key. Guessing is not faithfulness. The agent
 * must choose A, B, C, D, or E, and only then may state move.
 */
function parseAnswer(answer, q = {}) {
  const raw = String(answer || '').trim();
  const exact = raw.match(/^[A-E]$/i)?.[0]?.toUpperCase() || '';
  if (strictMode(q)) {
    const choice = exact ? choiceByKey(q, exact) : null;
    return {
      raw,
      key: choice?.key || exact || '',
      choice,
      confidence: choice ? 1 : 0,
      reason: '',
      strict: true,
      acceptedFormat: 'ONE EXACT LETTER: A, B, C, D, or E',
      rejection: choice ? '' : 'answer_must_be_one_exact_letter'
    };
  }
  const key = raw.match(/^\s*([A-E])(?:\b|[).:\-\s]|$)/i)?.[1]?.toUpperCase() || '';
  const lower = raw.toLowerCase();
  const choice = choiceByKey(q, key) || (q.choices || []).find(c => lower.includes(String(c.text || '').toLowerCase())) || null;
  return { raw, key: choice?.key || key || '', choice, confidence: choice ? 1 : 0.25, reason: raw.replace(/^\s*[A-E][).:\-]?\s*/i, ''), strict: false, rejection: choice ? '' : 'unparseable_choice' };
}

function rejectedPayload(parsed) {
  return {
    applied: false,
    error: parsed?.rejection || 'invalid_choice',
    message: 'This gate accepts only one exact letter: A, B, C, D, or E.',
    acceptedFormat: 'ONE EXACT LETTER: A, B, C, D, or E',
    didNotRecordAnswer: true,
    didNotApplySideEffects: true
  };
}

module.exports = { ANSWER_ALIASES, answerInputText, parseAnswer, rejectedPayload };
