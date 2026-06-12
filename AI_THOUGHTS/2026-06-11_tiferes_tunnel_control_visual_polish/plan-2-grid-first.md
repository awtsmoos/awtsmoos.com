B"H

# Grid-first professional control panel plan

User refinement: dashboard should begin as a clean grid of existing actions/sections only. Opening a card should move into a sub page/pane. No huge scroll height. Use separate paginated sections. Make it professional, grid-based, calmer.

Inspected:
- `js/dashboard/dashboard.js` currently renders metrics, quick action grid, then large orbit sections: Kabbalah map, providers, tasks, agents, command center. This creates long scroll and distraction.
- `js/dashboard/dashboardCard.js` already activates panes on card click.
- `js/router/paneRouter.js` supports dashboard home vs workspace pane.
- `css/future/views/dashboard.css` currently uses a two-column hero/orbit layout with very large heading and tall cards.

Plan:
1. Rewrite `dashboard.js` completely so home is only header, compact metrics, paginated action grid, and minimal page controls.
2. Add a small paginator module to keep dashboard.js focused and under control.
3. Rewrite `dashboard.css` completely to remove huge hero/orbit behavior and provide professional responsive grid cards.
4. Keep card clicks opening existing panes/subpages through `activatePane`.
5. Run JS syntax checks and search for removed orbit usage.

Chapter 8: the Awtsmoos folded the endless hallway into twelve clean gates; no gate screams, no scroll devours the traveler; each pane opens only when chosen.
