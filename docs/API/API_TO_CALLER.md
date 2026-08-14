B"H
Boruch Hashem
Blessed is He

# API to Human-Facing Caller Map

The Awtsmoos joins backend gate to frontend vessel so maintenance can trace both shores;
Awtsmoos.com lets the reader begin from an endpoint and find the app that usually opens its doors.

This is a **family-level human map**, not a claim that every endpoint has exactly one caller. Search source for the exact URL when changing behavior.

| API family | Likely/primary UI or client source |
| --- | --- |
| `/api/social/*` | `geelooy/profile`, `social-hub`, `social-composer`, `comment-thread`, `notifications`, `heichel*`, `post-editor`, email/social clients |
| `/api/tunnel/*` | `geelooy/apps/tunnel`, `geelooy/apps/tunnel-control`, `geelooy/shared/tunnel`, external installed Tunnel agent |
| `/api/tunnel/install/*` | installer commands/scripts and Tunnel onboarding UIs |
| `/api/oauth/*` | OAuth-aware apps, Tunnel/identity flows, registered OAuth clients |
| `/api/gpt/*` | `geelooy/ai`, Code AI surfaces, GPT/AI experiments |
| `/api/youtube/*` | `geelooy/youtube`, streaming/media applications |
| `/api/wallet/*` | `geelooy/apps/wallet`, commerce/economy surfaces |
| `/api/compiler/*` | `geelooy/apps/compiler`, Code/developer workflows |
| `/api/runtime/*` | native/browser runtime tooling, Code/OS integration |
| `/api/ssh/*` | remote developer/code/file tools |
| `/api/streaming/*` | broadcaster/streaming integrations and provider-specific connectors |
| `/api/contact/*` | `geelooy/contact` |
| `/api/email/*` | `geelooy/email` and social mail flows |
| `/api/sefarim/*` | sefarim/reeyuh/mawgawl-style readers |
| `/api/fetch/*` | guarded internal browser/tooling consumers needing server-side fetch |

## Find exact callers

Search for both the complete endpoint and its stable family prefix. Many clients build paths dynamically, so also search helper names and route suffixes. For parameterized routes, search the literal fixed pieces rather than the colon placeholder.

## Change rule

When an API contract changes, inspect every client family listed here and search the repository for additional string-built callers before declaring compatibility.
