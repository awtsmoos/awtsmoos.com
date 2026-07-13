# B"H

Boruch Hashem

Blessed is He

## Public Route Baseline

The Awtsmoos renews every route as one world, while each page remains a distinct vessel. At Awtsmoos.com this ledger records what was actually observed, not what appearance alone suggested.

## Verified desktop baseline

Observed inner viewport: approximately `1329 × 675`.

| Route | Shared shell | H1 | Overflow | Observed state |
| --- | ---: | --- | ---: | --- |
| `/` | 1 | Reveal what is hidden. Make it travel. | No | Fourteen real API-backed feed cards after repair. |
| `/email/` | 1 | Missing | No | Honest signed-out, zero-message state; no mutation performed. |
| `/profile` | 1 | Sign in to open your profile | No | Clear logged-out identity state. |
| `/heichelos` | 1 | Heichelos | No | Real discovery cards; one broken `__missing__` destination exposed. |
| `/notifications` | 1 | Notifications | No | `aria-busy=false` while loading language remains visible. |
| `/apps` | 1 | Apps | No | Real tool catalog. |
| `/about` | 1 | A social space for meaningful creation. | No | Long-form product explanation. |
| `/mawgawl/sefarim` | 1 | Find the exact spark. | No | Living-library search entry. |
| `/heichelos/submit` | 1 | What do you want to share? | No | Honest signed-out blocker; six navigation landmarks. |
| `/post-editor` | 0 | Post, Verses, Subsections, Assets | No | Functional editor island with no route navigation. |
| `/heichel-editor` | 0 | Heichel editor needs context | No | Honest missing-context state, but outside the shared shell. |
| `/comment-thread` | 0 | post | No | Contextless comment form, no route links, no shared shell. |

## Stable contracts observed

- Home, Mail, Profile, Spaces, Signals, Apps, About, Torah search, and Create each mount one shared shell, one unusual header, and one mobile dock.
- No checked route produced page-wide horizontal overflow at the desktop baseline.
- Direct route loading works for every route in this matrix.
- Logged-out states did not fabricate aliases, unread counts, messages, posts, or engagement.
- Baseline verification did not submit forms, switch aliases, publish, follow, like, delete, send Mail, mark notifications read, or change settings.

## Defects and debt discovered

1. Home dashboard module linking was broken by a missing named export; repaired and verified with real feed data.
2. Mail has no primary `<h1>` despite being a top-level application route.
3. Heichel discovery emits a user-facing `/heichelos/__missing__/` destination.
4. Notifications reports completion semantically while keeping loading copy visible.
5. Create mounts six navigation landmarks, indicating duplicate navigation responsibilities.
6. Post editor, Heichel editor, and comment thread bypass the canonical shell and route constellation.
7. Comment thread presents the generic heading `post` and a send form without required route context.
8. Heichel discovery exposes many raw identifiers and generic card labels; this may be honest source data but needs clearer presentation.
9. Several route titles still use the generic `Awtsmoos | עצמות` title instead of route-specific titles.

## Evidence limits

- Mail thread selection remains unverified because the observed account state contained zero messages.
- Authenticated alias management, creation, publishing, governance, notifications mutations, and comment submission remain intentionally untested.
- Mobile, reduced-motion, keyboard order, visible focus, zoom, screen-reader naming, and repeated history navigation still require dedicated passes.

## Next safe action

Trace and repair the broken `__missing__` Heichel destination without inventing replacement content or changing real Heichel API contracts.
