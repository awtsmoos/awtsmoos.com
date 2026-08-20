B"H

# 03 — Critique and Security: Sixty Boundaries Before Git Becomes Public Infrastructure

Boruch Hashem. Blessed is He.

1. Do not expose arbitrary VFS paths through `/git/`.
2. Git URL resolves a stored repo mapping first.
3. Do not implement pack protocol manually if real Git backend is available.
4. Do not execute shell-concatenated repository URLs.
5. Prefer `spawn`/`execFile` argument arrays.
6. Restrict initial remote clone protocol to HTTPS unless another protocol is deliberately authorized.
7. Do not allow `file://` clone to escape server filesystem boundaries.
8. Do not allow remote helper injection through crafted URL schemes.
9. Bound clone/fetch/push time.
10. Bound object/pack bytes.
11. Bound repository count/storage per alias according to product quota.
12. Never log GitHub tokens/app passwords.
13. Never store plaintext app passwords.
14. Plaintext secret is shown once.
15. Hash verifier with current password policy.
16. Separate credential display name from secret.
17. Support revocation.
18. Support expiration.
19. Support rotation.
20. Support repo-specific scope.
21. Separate read from write permission.
22. Force push is a separate stronger permission.
23. History deletion/rewrite must be explicit.
24. Anonymous Git read requires repository visibility `public`.
25. Public website visibility does not automatically imply public Git repository visibility.
26. Public Git repository does not automatically imply public website publication.
27. `.git` is always blocked from website direct-serving.
28. Direct site source and Git working tree may coexist without exposing Git internals.
29. Do not store provider tokens inside remote URL.
30. Scrub credentials from command stderr/stdout before logs.
31. Prevent SSRF through clone URLs with URL/network policy.
32. Validate redirects.
33. Do not permit localhost/private-network cloning unless explicit admin capability exists.
34. Git smart HTTP must validate service name exactly.
35. Upload-pack may be anonymous only for public repos.
36. Receive-pack always requires authenticated write scope.
37. Basic Auth username is never authorization by itself.
38. App-password verifier lookup must be constant-time where applicable.
39. Rate-limit credential verification attempts.
40. Record bounded last-used testimony, not request secrets.
41. Repo mappings must survive working-tree moves only through explicit remap/sync.
42. Delete repo mapping must not silently destroy source without an explicit destructive action.
43. Import should be atomic enough to avoid half-cloned VFS trees.
44. Failed clone leaves no authoritative repo mapping.
45. Push receipt should expose old/new SHA and ref, not raw secrets.
46. Pull/merge conflict must not silently overwrite VFS files.
47. AI history actions must operate on explicit commit/ref evidence.
48. AI should never force-push implicitly.
49. AI-generated commit must have a visible diff before commit/push when interactive UI is used.
50. Tunnel mutation replay must reconcile status before duplicate push/clone actions.
51. Public-site publish mutation uses publication status reconciliation.
52. Git push mutation uses local/remote ref reconciliation.
53. Credential creation is never blindly replayed after accepted ambiguity because it could mint multiple secrets.
54. UI must separate working-tree dirty state from remote ahead/behind state.
55. UI must separate site live state from repository push state.
56. GitHub push success is not production deployment success.
57. Production deployment should identify exact Git commit SHA.
58. Existing protected dirty files must not be reset/cleaned.
59. Whole-file rewrite law remains absolute for tracked source edits.
60. Every new authored source/test file stays under 120 lines and responsibilities are split before compression.
61. Docs schemas must describe permissions/replay behavior, not only action names.
62. Tunnel discovery health must not override an individual action’s acceptance state.
63. App password and OAuth credential systems should reuse existing credential infrastructure if one exists.
64. Do not create a second password hashing system before inspecting current authentication code.
65. Virtual OS Git remote needs a canonical URL from server mapping, never path guessing.
66. Any future SSH Git transport requires separate key-management architecture; do not fake it through password HTTP.
67. UI must make destructive history operations visually distinct.
68. Clone/import dialogs must show target path and collision behavior before mutation.
69. Remote manager must never echo token-bearing URLs.
70. Repository history should remain auditable after AI operations.

## Revised product boundary

Ship in layers:

Layer 1: finish direct/snapshot public-site backend + Tunnel/docs + publish UI.

Layer 2: repository identity, Git clone/import, GitHub remotes/push, app-password service, smart HTTP clone/push.

Layer 3: rich Code/Virtual OS Git UI, history graph, AI diff/history actions.

All layers use one repository/site identity model and one credential service.

The Awtsmoos reveals history by preserving boundaries. A system “better than GitHub” is not one that hides complexity; it is one that makes authority, source, history, deployment, and credentials impossible to confuse.
