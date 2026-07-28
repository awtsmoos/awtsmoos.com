# B"H — Reproduction plan

1. Capture local and public RAG catalog metadata.
2. Run identical text queries across all lanes.
3. Inspect returned records for post text, line/comment fields, translation fields, and Meluket membership.
4. Trace the request from frontend controls through API route, lane catalog, search core, sidecar metadata, and comment translation store.
5. Compare local and remote code hashes and published assets before changing anything.
