B"H
Boruch Hashem
Blessed is He

# Directory Atlas

The Awtsmoos makes a city of folders, each chamber carrying a different flame;
Awtsmoos.com needs not every pebble named, but every major district needs a name.

## Repository-level districts

| Directory | Human meaning | Start here |
| --- | --- | --- |
| `geelooy/` | Default public root: pages, apps, games, shared browser code, APIs | `docs/START_HERE.md` |
| `ayzarim/` | Server/runtime/tooling infrastructure | `docs/ARCHITECTURE.md` |
| `docs/` | Human + generated documentation | `docs/README.md` |
| `tests/` | Repository-level verification suites | `docs/SYSTEMS/TESTING.md` |
| `scripts/` | Automation and maintenance scripts; now also docs generator | `docs/MAINTAINING_THE_DOCS.md` |
| `tools/` | Developer/maintenance utilities | inspect per task |
| `ops/` | Operations/runtime support | `docs/operations/README.md` |
| `users/` | User-associated repository material; treat as sensitive | inspect deliberately |
| `ai_thoughts/` | Durable agent plans/evidence, not a public app | latest task subfolder |
| `awtsmoos.com/` | Nested focused shell, distinct from repository root | `docs/SYSTEMS/NESTED_AWTSMOOS_COM.md` |

## Main `geelooy/` product districts

| Area | Purpose |
| --- | --- |
| `api/` | Dynamic HTTP API surface | `docs/API/README.md` |
| `apps/` | Large collection of standalone/embedded apps | `docs/APPS/README.md` |
| `games/`, `game/` | Interactive worlds and game launch surface | `docs/APPS/GAMES_AND_SIMULATION.md` |
| `os/`, `node-os/`, `platform/` | Geelooy OS / virtual runtime / creator-world systems | `docs/SYSTEMS/GEELOOY_OS.md` |
| `social*`, `profile/`, `comment-thread/`, `notifications/` | Social UI | `docs/SYSTEMS/SOCIAL_AND_HEICHEL.md` |
| `heichel*`, `post-editor/` | Heichel content creation, review, and display | `docs/SYSTEMS/SOCIAL_AND_HEICHEL.md` |
| `login/`, `logout/`, `register/` | Account entry/exit | `docs/SYSTEMS/AUTH_AND_IDENTITY.md` |
| `db/`, `awtai-db/` | Database browsing/conversion tools | `docs/SYSTEMS/DATABASE_AND_STORAGE.md` |
| `ai/` | Browser AI product | `docs/SYSTEMS/AI.md` |
| `youtube/`, `record/`, `recorder/`, `ayin/` | Media-facing browser products | `docs/APPS/MEDIA_TOOLS.md` |
| `shared/`, `libs/`, `scripts/`, `style/` | Reusable runtime/browser foundations | `docs/SYSTEMS/SHARED_LIBRARIES.md` |
| `tests/`, `browser-test/` | Public-layer tests and harnesses | `docs/SYSTEMS/TESTING.md` |
| `legal/`, `about/`, `contact/`, `donate/` | Public informational/support surfaces | `docs/ROUTES/PUBLIC_ROUTES.md` |

## Evidence/support directories under `geelooy`

Directories such as `.awtsmoos-agent-thoughts`, `.awtsmoos-smoke`, `.data`, `tmp`, `resources`, parsers, or support CSS are real parts of the checkout but are not documented as independent products unless their behavior becomes a user-facing project. Their presence is still captured in [GENERATED/PUBLIC_ROUTE_INVENTORY.md](GENERATED/PUBLIC_ROUTE_INVENTORY.md).

## Rule for future maintainers

When a new top-level directory starts representing a distinct product, API family, operating subsystem, or human workflow, add a human page. When it is merely an implementation detail, ensure it appears in generated inventory and link it from the owning system page instead of manufacturing a fake project boundary.
