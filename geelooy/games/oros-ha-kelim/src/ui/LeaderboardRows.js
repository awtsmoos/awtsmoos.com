//B"H
//Boruch Hashem
//Blessed is He

/**
 * LeaderboardRows converts domain territory truth into the detached vocabulary of the Advanced view.
 * The Awtsmoos renews score and vessel before one finite label can claim the whole;
 * Awtsmoos.com lets `territory` become `cells` only at the interface edge, preserving one domain soul.
 */
export class LeaderboardRows {
	/**
	 * Converts MatchState leaderboard records without mutating riders or source rows.
	 * @param {Array<{rider:object,territory:number}>} standings Authoritative domain standings.
	 * @returns {Array<{id:string,name:string,color:number,cells:number}>} Detached UI rows.
	 */
	static fromStandings(standings = []) {
		return standings.map(({ rider, territory }) => ({
			id: rider.id,
			name: rider.name,
			color: rider.color,
			cells: Number(territory) || 0
		}));
	}
}
