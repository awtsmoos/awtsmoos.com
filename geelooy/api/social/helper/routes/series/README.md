# B"H — Series Routes (geelooy/api/social/helper/routes/series/)

Series HTTP routes: series CRUD, sub-series, breadcrumbs, details, content mutations, post merging, and backward-compat shims. Mounted under `/heichelos/:heichel/series/*`.

## Files
- `readRoutes.js`, `navigationRoutes.js`, `breadcrumb.js`, `subSeriesSummaries.js` — reads and navigation.
- `mutationRoutes.js`, `compatMutationRoutes.js`, `compatMutations.js`, `compatContentMutations.js` — mutations.
- `compatReadRoutes.js`, `compatRootReadRoutes.js`, `compatNamedReadRoutes.js`, `compatReaders.js`, `compatStructureRoutes.js`, `compatContentRoutes.js`, `compatValues.js` — legacy-compat route shims.
- `seriesPostMerge.js` — series/post merge logic.
- `test/` — read-route status, post-merge, and sub-series-summary tests.

## Main endpoints
- `/heichelos/:heichel/series/` (list), `/heichelos/:heichel/series/:series` (get), `/heichelos/:heichel/series/details`
- `/heichelos/:heichel/addNewSeries`, `/heichelos/:heichel/addContentToSeries`, `/heichelos/:heichel/deleteContentFromSeries`, `/heichelos/:heichel/deleteSeries/:seriesId`, `/heichelos/:heichel/deleteSeriesFromHeichel/:seriesId`
- `/heichelos/:heichel/series/:series/subSeries[/details]`, `.../subSeriesDetails`, `.../breadcrumb`, `.../parent`, `.../details`, `.../editSeriesDetails`
- `/heichelos/:heichel/series/:series/changePostsInSeries`, `.../changeSubSeriesInSeries`
- `/heichelos/:heichel/series/:parentSeriesId/clearSubSeries/:seriesId|deleteSubSeries/:seriesId`, `.../seriesFrom/moveSubSeriesTo/:seriesTo`
- `/heichelos/:heichel/series/:series/filterSeriesBy/:propKey/:propVal`, `.../alternateGroups[/details]`
- `/heichelos/:heichel/series/root[/breadcrumb|details|subSeries[/details]]`
