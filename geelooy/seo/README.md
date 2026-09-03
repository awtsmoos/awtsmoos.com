B"H
Boruch Hashem
Blessed is He

# Awtsmoos.com Public Indexing Architecture

The Awtsmoos gives public content an ordinary semantic road before client JavaScript begins to shine. This directory documents the indexing vessels that keep Awtsmoos.com crawlable without turning private/action surfaces into search pages.

## Public content families

- Heichel roots, series, and Torah posts: dynamic SSR with stable post canonicals.
- Aliases: validated dynamic SSR with profile, bounded authored posts, public discussion, and `ProfilePage` JSON-LD.
- Native comments/replies: canonical comment routes discovered from compact alias indexes.
- Imported English translations: deterministic manifest-backed pages with English and Hebrew source rows.
- Apps and games: registry-backed static HTML enrichment plus catalog/family sitemaps.
- About, Contact, Docs, Social, Apps root, Games root: curated authored static pages.

## Static HTML enrichment

`ayzarim/awtsmoosDynamicServer/static/PublicHtmlSeo.js` runs only for exact generated metadata records. It fills missing description, robots, canonical, OpenGraph, Twitter, and JSON-LD while preserving authored equivalents. Unknown HTML is unchanged.

Generated metadata lives under `geelooy/seo/generated/public-pages/` and is rebuilt by:

`node geelooy/scripts/seo/writeArtifacts.mjs`

## Discovery graph

`/robots.txt` points to `/sitemap.xml`. The root sitemap links bounded family sitemaps. Core discovery contains only durable public roots; app/game catalog URLs live in their family sitemaps to avoid duplicate crawl entries.

Auth, API, edit, submit, delete, admin, internal, debug, staging, and similar action surfaces are intentionally excluded.

## Audits

Static audit:

`node geelooy/scripts/seo/audit/run.mjs`

This fails on missing files/titles, duplicate canonicals, duplicate/invalid sitemap URLs, or sitemap size/count overflow. Missing visible H1 is advisory because hidden crawler-only headings are forbidden.

Translation corpus integrity is covered by `translationIntegrity.mjs` and its regression test. It verifies manifest bundle existence and row-ID uniqueness. Human translation titles are not fabricated because current imported manifests do not provide a trustworthy title field.

Runtime audit against a local server:

`node geelooy/scripts/seo/runtimeAudit/run.mjs http://127.0.0.1:PORT`

The runtime audit walks sitemap indexes with bounded URL count and concurrency, exposes redirects, and reports HTML title/canonical advisories. It is diagnostic only and never runs inside production requests.

## Important quality boundaries

- Canonical URLs must be final 200 URLs, never redirecting extensionless directory forms.
- Generated registry metadata refuses missing target files.
- Authored `noindex`, canonical, JSON-LD, OpenGraph, and Twitter tags are preserved.
- No fake `lastmod`, ratings, prices, publication dates, translation titles, or `hreflang` values are generated.
- Alias authored-post discovery is bounded to 12 records.
- Comment sitemap aliases paginate by 500; comment shards split at 10,000.
- Source and generated JS modules remain at or below 120 lines.

## Release gate

Before production activation: focused SEO tests, Heichel quality tests, route tests, artifact idempotence, XML parsing, line ceilings, static audit, bounded runtime audit, and `git diff --check` must pass. Release uses a clean worktree and exact-SHA guarded activation, followed by raw public-origin acceptance.
