B"H
Boruch Hashem
Blessed is He

# Mail, Notifications, and Drive

Social includes user-facing communication and storage subsystems that share identity but have distinct persistence/permission rules.

## Mail

Mail routes cover get/read/send/delete/thread/settings/approval/unread/notify/universe mirror concepts. `/api/email` is a smaller façade over mail-oriented behavior.

## Notifications

Alias notifications support read/archive/poll/preferences/unread/digest/fanout patterns.

## Drive

Alias Drive supports entries, stream/public/immutable paths, copy/move/trash/restore/purge, credentials, usage/quota/reconciliation, site and manager/admin surfaces.

## Security

Identity alone does not grant arbitrary Drive path mutation or mail impersonation. Follow alias/service/credential/ownership checks in each handler.
