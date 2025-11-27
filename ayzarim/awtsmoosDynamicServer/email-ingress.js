//B"H
modules.export = async function ({ sender, recipients, data }) {
    try {
        var time = Date.now();
        // Sender: "bob@gmail.com" -> "bob_at_gmail.com"
        var cleanSender = sender.replace("@", "_at_").replace(/[<>]/g, "");

        for (var r of recipients) {
            // Recipient: "me@awtsmoos.com" -> "me_at_awtsmoos.com"
            var cleanRecipient = r.replace("@", "_at_").replace(/[<>]/g, "");
            
            // NEW UNIFIED PATH: /emails/[ME]/threads/[FRIEND]
            // "friend" here is the Sender
            var path = `/emails/${cleanRecipient}/threads/${cleanSender}`;

            // We save it as "incoming" because 'gotMail' handles *incoming* SMTP
            await this.db.appendToObj(path, {
                key: time + "",
                value: {
                    rawData: data + "", // Store raw SMTP for parsing
                    time: time,
                    read: false,
                    direction: "incoming",
                    correspondent: cleanSender
                }
            });
        }
        console.log("B\"H - Saved Incoming Email Thread:", sender, recipients);
    } catch ($) {
        console.log("Error saving incoming email", $);
    }
}