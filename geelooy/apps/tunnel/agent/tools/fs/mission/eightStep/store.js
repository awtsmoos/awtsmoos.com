// B"H
function ensure(m) { m.next8 ||= { rounds: [], currentRoundId: '' }; return m.next8; }
function current(m) { const box = ensure(m); return box.rounds.find(r => r.id === box.currentRoundId) || box.rounds[box.rounds.length - 1] || null; }
function addRound(m, round) { const box = ensure(m); box.rounds.push(round); box.currentRoundId = round.id; return round; }
function pending(round) { return (round?.steps || []).find(s => s.status === 'pending' || s.status === 'running') || null; }
function byIndex(round, index) { return (round?.steps || [])[Number(index) || 0] || null; }
module.exports = { ensure, current, addRound, pending, byIndex };
