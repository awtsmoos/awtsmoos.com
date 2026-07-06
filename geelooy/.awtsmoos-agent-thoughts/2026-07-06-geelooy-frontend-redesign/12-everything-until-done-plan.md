B"H

# Everything until done: live QA closure plan

The remaining gap is not contracts; it is real mobile/browser proof. This pass will not merely style. It will:

1. Start or discover a local server for Geelooy/Awtsmoos if scripts exist.
2. Use Chrome target tools to find an actually navigable page.
3. If public `https://awtsmoos.com` cannot navigate through tunnel Chrome, use local preview/static server.
4. Capture or inspect viewport states where possible:
   - Home
   - Email
   - Profile
   - Heichelos spaces
   - Submit/create
5. If browser remains blocked, build local isolated visual smoke pages using existing route HTML/CSS and test them through static file tooling where possible.
6. Continue fixing visible/static issues uncovered by actual tests and DOM/screenshot checks.
7. Run full relevant contract/syntax suites after every repair.

No partial file edits. Whole-file rewrites only.
