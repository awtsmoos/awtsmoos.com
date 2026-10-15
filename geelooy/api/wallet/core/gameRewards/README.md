# B"H — Game Rewards (geelooy/api/wallet/core/gameRewards/)

Game reward economy: catalogs of rewards, claim flow, daily policy, results.

Files:
- `catalog.js` — reward catalog
- `claim.js` — claiming a reward
- `day.js` — daily/periodic reward logic
- `policy.js` — reward policy rules
- `result.js` — claim results

Exposed via the `game-rewards/claim` route; tested by
`tests/gameRewards.test.js`, `tests/gameRewardPolicy.test.js`, and
`tests/gameRewardRoute.test.js`.
