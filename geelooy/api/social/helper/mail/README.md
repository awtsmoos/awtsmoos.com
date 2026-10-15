# B"H — Mail (geelooy/api/social/helper/mail/)

Full mail domain: domains, mailboxes, sending (SMTP/local/system), rules, threads, and notifications. Mounted via `_awtsmoos.mail.js`.

## Files
- `MailDomainService.js`, `mailUniverse.js` — domain and universe management.
- `mailboxService.js`, `mailboxMutations.js` — mailbox read/mutations.
- `sendService.js`, `smtpDelivery.js`, `localDelivery.js`, `systemDelivery.js` — sending and delivery paths.
- `messageCodec.js`, `messageRecords.js` — message encoding and records.
- `threadReader.js` — thread reads.
- `addressResolver.js`, `rulesRunner.js` — address resolution and mail rules.
- `notificationService.js` — mail notifications.
- `settingsService.js` (+ `settingsService.test.js`), `globalForwardingSettings.js` — settings.
- `test/` — `mailUniverse.test.mjs`.
