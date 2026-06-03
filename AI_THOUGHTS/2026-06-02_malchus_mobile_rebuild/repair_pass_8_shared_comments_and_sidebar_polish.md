B"H
# Repair Pass 8 — Same Comment Renderer, Safer Scroll Details, One Sidebar Design

User reports:
- Inline technically works but can cut comments or show duplicate comments.
- Inline should show exactly the same comment content as the sidebar.
- Sidebar comment styles need the same polished violet/gold design language.
- Scroll Details is unsafe and ugly because raw HTML/script text appears in description.
- Sidebar has duplicate-looking headers and breadcrumbs.

Inspected:
- `comments/render/core.js`
- `comments/render/corePopulation.js`
- `comments/render/factories/standardCard.js`
- `comments/render/factories/SidebarCardFactory.js`
- `comments/render/factories/InlineCardFactory.js`
- `comments/render/tree.js`
- `comments/logic/treeBuilder.js`
- `comments/inline/weaving/SparkFixer.js`
- `comments/inline/weaving/GuardianGate.js`
- `comments/inline/loading/*`
- `comments/panel/rendering.js`
- `tabs/manager/*`
- `functions/ui/info.js`
- active CSS stack under `styles/ideal/reborn/`

Fix strategy:
1. Create one shared comment-card factory used by sidebar and inline.
2. Sidebar and inline both call that shared renderer, so body content is identical.
3. Deduplicate comments by stable ID before tree building and before inline placement.
4. Stop mutating inline comment dayuh destructively where possible.
5. Polish shared comment card CSS so sidebar and inline share palette and hierarchy.
6. Rewrite Scroll Details renderer: text-only sanitization, no raw HTML/script display, clear cards, book/person SVG-like graphics from CSS/DOM structure.
7. Rewrite breadcrumbs/header behavior: one title row; breadcrumbs are compact trail chips, active chip can replace/act as current path without duplicate giant headers.
8. Verify syntax, tests, grep for bad raw script/HTML rendering and duplicate-risk patterns.

Every modified file is rewritten completely. No partial patching.