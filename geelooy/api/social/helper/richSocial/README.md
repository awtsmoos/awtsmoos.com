# B"H — Rich Social (geelooy/api/social/helper/richSocial/)

Rich post system: schema-driven rich posts with sections, attachments, creator metadata, provenance, and sanitization. Mounted via `_awtsmoos.richSocial.js`.

## Files
- `index.js`, `RichPostService.js` — module entry and service.
- `RichPostSchema.js`, `RichPostOptions.js`, `SectionSchema.js` — post and section schemas.
- `AttachmentSchema.js`, `AttachmentStorageSchema.js` — attachment schemas.
- `CreatorMetadataSchema.js`, `CreatorSocialMetadataSchema.js`, `CreatorDistributionSchema.js` — creator metadata and distribution.
- `DiscussionTargets.js` — discussion targeting.
- `InternalCloneSourceSchema.js`, `SourceProvenanceSchema.js` — clone source and provenance.
- `TextSanitizer.js` — text sanitization.
- `test/` — attachment storage, clone source, routes, schema, and service tests.
