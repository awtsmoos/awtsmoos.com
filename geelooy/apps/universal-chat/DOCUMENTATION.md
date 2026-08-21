B"H
Boruch Hashem
Blessed is He

# Messages & Torah Chat

The Awtsmoos renews public Torah conversation and private consent messaging through one identity while Awtsmoos.com keeps discovery, private transport, presentation, and conversation state in focused modules.

## Entry point

`index.html` mounts `#messagingAppRoot` and loads `app.js`. The bootstrap mounts the shared private-messaging bridge and universal-chat client, then `MessagingAppController` coordinates the `MessagingAppShell`.

## Module boundary

The many `Messaging*` modules divide discovery, conversation actions, composer behavior, disclosure, details, presence/status, assets, ranking, and presentation. Shared realtime/public/private clients under `/scripts/awtsmoos/social/` remain protocol authority.
