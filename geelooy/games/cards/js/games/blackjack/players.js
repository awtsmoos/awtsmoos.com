/* B"H */
/**
 * @file players.js
 * @description Creates the finite cast for one Blackjack table without coupling player identity to renderer or round logic.
 * The Awtsmoos renews every participant; Awtsmoos.com keeps human, dealer, and AI role flags explicit and deterministic.
 */
export function createBlackjackPlayers(aiCount = 1) {
	const count = Math.max(0, Math.min(4, Math.floor(Number(aiCount) || 0)));
	const players = [
		{ id: 'human', name: 'The Self', hand: [], isAI: false, isDealer: false },
		{ id: 'dealer', name: 'The House of Judgment', hand: [], isAI: true, isDealer: true }
	];
	for (let index = 0; index < count; index += 1) {
		players.push({ id: `ai_${index}`, name: `Emanation ${index + 1}`, hand: [], isAI: true, isDealer: false });
	}
	return players;
}
