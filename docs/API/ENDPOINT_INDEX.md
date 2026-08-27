B"H
Boruch Hashem
Blessed is He

# Endpoint Index

The Awtsmoos lets a human choose a family before descending into hundreds of lines;
Awtsmoos.com keeps the full route atlas below while this page gives the architectural signs.

## Mount families

| Prefix | Primary source | Purpose |
| --- | --- | --- |
| `/api` | `geelooy/api/_awtsmoos.derech.js` | Root/demo/legacy dynamic routes |
| `/api/admin` | `api/admin/_awtsmoos.derech.js` | Privileged admin code route |
| `/api/compiler` | `api/compiler/` | Compiler/backends/build/Rebbe Android |
| `/api/contact` | `api/contact/` | Contact submission/status |
| `/api/email` | `api/email/` | Mail routes / social-mail adaptation |
| `/api/fetch` | `api/fetch/` | Guarded server-side fetch proxy |
| `/api/gpt` | `api/gpt/` | AI health/capability/chat/reset |
| `/api/oauth` | `api/oauth/` | OAuth authorization/token/client/session routes |
| `/api/ohr-hagnuz` | `api/ohr-hagnuz/` | Realtime game ticket API |
| `/api/public` | `api/public/` | Public DB read plus privileged mutation surface |
| `/api/runtime` | `api/runtime/` | Native capability/launch/status/stop |
| `/api/sefarim` | `api/sefarim/` | Sefer/section/subsection retrieval |
| `/api/social` | `api/social/` | Large social/content/drive/graph domain |
| `/api/ssh` | `api/ssh/` | SSH connect, execute, file/folder operations |
| `/api/streaming` | `api/streaming/` | Streaming connectors and action dispatch |
| `/api/text` | `api/text/` | Text/timestamp source; currently syntax-broken |
| `/api/tunnel` | `api/tunnel/` | Tunnel status/client/request/fs |
| `/api/tunnel/control` | `api/tunnel/control/` | Full Tunnel Control platform |
| `/api/tunnel/install` | `api/tunnel/install/` | Public installers/bundles |
| `/api/wallet` | `api/wallet/` | Wallet/commerce/PayPal |
| `/api/youtube` | `api/youtube/` | YouTube account/media/live management |

## Root-direct APIs outside derech inventory

Root `index.js` handles `/mitzvahWorld/autoplay-ping`, `/mitzvahWorld/autoplay-report`, and `/api/mitzvahWorld/autoplay-report` before generic routing.

## How to get every concrete pattern

Search [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md). It is deliberately long because it is the mechanical route-to-source layer. For any pattern containing `:name`, use [../ROUTES/DYNAMIC_PATHS.md](../ROUTES/DYNAMIC_PATHS.md).

## Route-table families included mechanically

The generator evaluates known table-driven route modules for OAuth, Ohr HaGnuz, Tunnel Control, Wallet, YouTube, and Streaming in addition to scanning static route-shaped registrations. That is essential because many callable routes are not literal object keys inside the derech file itself.
