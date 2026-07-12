# B"H — Phase One: Unbounded Product Brainstorm

## Product thesis
Geelooy should feel like one living application rather than a stack of unrelated pages. The strongest qualities of Facebook, YouTube, Instagram, and LinkedIn are not their decoration but their orientation: the user always knows where they are, what is new, what they can create, and how to return. Geelooy can combine that clarity with a distinct luminous identity.

## Experience possibilities
1. A fixed desktop navigation rail and a compact mobile dock share one canonical route map.
2. A global command/search field opens Sefarim, spaces, people, posts, mail, and apps without creating duplicate page-specific search controls.
3. The home page becomes a true three-column social dashboard: navigation rail, feed, and useful context rail.
4. Feed tabs stay, but the content area is wide enough for media and comments.
5. Create is a single prominent action that can reveal Post, Heichel, message, and alias choices.
6. Profiles become identity dashboards with aliases, owned spaces, recent work, and settings.
7. Mail becomes a modern split-pane messenger with a responsive thread drawer.
8. Notifications become an automatically hydrated signal center rather than a form that first asks for an alias already known to the session.
9. Search becomes a universal route; Sefarim search remains the deep Torah lane within it.
10. Apps become a curated launcher with categories, descriptions, keyboard filtering, and honest route links.
11. Login and register use the same visual language but retain server-native form submission and cache rules.
12. About becomes a readable editorial page with structured sections instead of one unbounded paragraph.
13. Every page uses a small number of stable design tokens and components.
14. Gradients should create depth, not obscure text.
15. Motion should confirm navigation and state changes, not continuously distract.
16. View Transitions can preserve the feeling of a single-page application while full server routes remain reliable.
17. Prefetch should extend to every main route but never intercept downloads, forms, external links, hash-only movement, or modified clicks.
18. API errors should appear in cards with retry controls, never vanish into the console.
19. Loading states should use skeletons or concise progress text, not indefinite spinners.
20. Empty states should propose a real next action.

## Architecture possibilities
- Replace the home CSS import avalanche with a new focused `style/geelooy-app/` system.
- Keep old styles on untouched deep routes; new shell styles must be namespaced to avoid breaking posts.
- Drive shell navigation from data in one route module.
- Create a DOM factory for shell elements rather than duplicating HTML in every page.
- Use progressive enhancement: every link and form works without JavaScript.
- Upgrade app navigation from view-transition-only to safe document swapping only after proving scripts and server templates can be rehydrated. Until then, server navigation plus prefetch is the safer seamless model.
- Build API status utilities shared by home, profile, notifications, mail, and search.
- Add contract tests around route matching, shell generation, and no-broken-link guarantees.

## Risks to design around
- Existing CSS has multiple overlapping generations and may override new rules.
- Server-rendered `<?Awtsmoos` templates cannot be treated as plain static HTML.
- Full DOM swapping can break inline server-generated scripts, mail sockets, and page-specific module lifecycle.
- API mutation tests can alter real user data; only GET endpoints should be exercised live without a test identity.
- The current root page contains duplicate legacy and new navigation structures.
- Mobile viewport height and safe-area handling can cause docks to cover content.
- Heichel and post pages already work and must not inherit overly broad selectors.

## Phase-one conclusion
The highest-leverage transformation is a namespaced unified shell plus focused page compositions. It removes duplicate navigation, fixes the home layout, expands route coverage, preserves working deep content, and allows every main page to adopt one coherent system without rewriting the entire backend.
