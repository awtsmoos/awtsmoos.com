B"H

# Home Core Split Completion Audit

## Why this pass happened

After visual scroll safety was implemented and guarded, the next real architectural debt was Home core CSS ownership. The older public Home files were not huge, but they mixed multiple vessels per file while beauty and legend layers had already been split very finely. This pass split Home core into exact vessels while keeping public compatibility filenames stable.

## Files created

Shell:
- `geelooy/style/social/home/core/shell/page.css`
- `geelooy/style/social/home/core/shell/surfaces.css`

Sanctuary:
- `geelooy/style/social/home/core/sanctuary/shell.css`
- `geelooy/style/social/home/core/sanctuary/glow.css`
- `geelooy/style/social/home/core/sanctuary/logo.css`
- `geelooy/style/social/home/core/sanctuary/type.css`
- `geelooy/style/social/home/core/sanctuary/links.css`

Feed:
- `geelooy/style/social/home/core/feed/shell.css`
- `geelooy/style/social/home/core/feed/header.css`
- `geelooy/style/social/home/core/feed/tabs.css`
- `geelooy/style/social/home/core/feed/composer.css`

Post card:
- `geelooy/style/social/home/core/post-card/surface.css`
- `geelooy/style/social/home/core/post-card/author.css`
- `geelooy/style/social/home/core/post-card/body.css`
- `geelooy/style/social/home/core/post-card/media.css`

Discovery:
- `geelooy/style/social/home/core/discovery/shell.css`
- `geelooy/style/social/home/core/discovery/links.css`

Responsive:
- `geelooy/style/social/home/core/responsive/tablet.css`
- `geelooy/style/social/home/core/responsive/phone.css`

## Files rewritten as compatibility wrappers

- `geelooy/style/social/home/shell.css`
- `geelooy/style/social/home/sanctuary-card.css`
- `geelooy/style/social/home/feed-shell.css`
- `geelooy/style/social/home/feed-tabs.css`
- `geelooy/style/social/home/composer.css`
- `geelooy/style/social/home/post-card.css`
- `geelooy/style/social/home/discovery-card.css`
- `geelooy/style/social/home/responsive.css`

## Verification

Passed:
- `node geelooy/heichelos/heichel/modules/test/homeFeedContract.test.mjs`
- `npm run test:css-quality`
- `node geelooy/style/test/beautyImportGraph.test.mjs`
- `node geelooy/style/test/legendImportGraph.test.mjs`

Line budget:
- Every new Home core CSS file is between 3 and 20 lines.

## Known truth

The public Home CSS entry remains stable through wrappers. The deeper import graph now owns one vessel per tiny module, which makes later Home loading/empty/error/auth/feed work safer.
