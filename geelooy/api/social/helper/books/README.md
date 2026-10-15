# B"H — Books (geelooy/api/social/helper/books/)

Print-book builder: renders collections of posts (series trees, translations) into printable books and downloadable zips.

## Key files
- `routeService.js` — HTTP route service for book endpoints.
- `bookBuilder.js`, `renderBook.js`, `renderChapter.js`, `renderFrontMatter.js`, `renderJobIndex.js` — build and render book parts.
- `html.js`, `printCss.js` — HTML/print styling of rendered books.
- `seriesTree.js`, `originalText.js`, `translationText.js`, `alignment.js` — source content (tree, Hebrew original, translations, alignment).
- `sourceCommon.js`, `sourceHttp.js`, `sourceInternal.js` — source adapters.
- `jobLauncher.js`, `jobStore.js`, `worker.js`, `workerLease.js` — background job queue for book builds with worker leasing.
- `download.js`, `zipWriter.js`, `paths.js`, `options.js` — downloads and zip packaging.
- `test/` — render, routes, resilience, zip, tree, and unicode-download tests.

## What it does
Takes a series (or translation bundle), queues a build job, renders front matter + chapters with print CSS, and packages the result as a downloadable book zip.
