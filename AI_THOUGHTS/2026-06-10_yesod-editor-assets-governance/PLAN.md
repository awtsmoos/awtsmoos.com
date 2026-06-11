B"H

# Yesod Editor Assets Governance Pass

## Living target
Implement the first complete production-shaped slice of the requested system:
1. Structured post editor API and UI modules for root, verses, subsections, comments anchors, and publish/submit status.
2. Heichel editor/governance API for owner/admin/contributor roles, invitations, submissions, approvals, and policies.
3. Alias-owned binary asset upload with multipart parsing, size limits, MIME limits, rate limiting, storage paths, manifests, and attachment coordinates for post root / verse / subsection / comment.
4. AwtsDB migration additions: connected post bodies in social.core.awtsdb, all-post census in social.allPosts.awtsdb, metadata in social.meta.awtsdb, governance edges in social.graph.awtsdb.
5. Localhost Node tests generating random image/audio files and uploading them through the API.
6. Fall back reads from old system while writing new sidecars.

## Constraints
Full-file rewrites only. No partial patching. Keep modules small. Test actual fields and upload behavior.
