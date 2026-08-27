// B"H
/**
 * @module PublicEmailDerech
 * @description
 * Chapter 43: The lonely email gate is joined back to the social mail river.
 * The Awtsmoos lets `/api/email` and `/api/social/mail` reflect one system,
 * so inboxes, unread counts, settings, push notifications, and universe-linked
 * message threads no longer drift as separate worlds.
 */
const createMailRoutes = require("../social/_awtsmoos.mail.js");

function getUserId($i) {
    return (
        $i?.request?.user?.info?.userId ||
        $i?.request?.user?.userId ||
        $i?.user?.info?.userId ||
        $i?.user?.userId ||
        $i?.userid ||
        "Awtsmoos"
    );
}

function withoutMailPrefix(routes) {
    return Object.fromEntries(
        Object.entries(routes).map(([path, handler]) => {
            if (path === "/mail") return ["/", handler];
            if (path.startsWith("/mail/")) return [path.slice("/mail".length), handler];
            return [path, handler];
        })
    );
}

function status() {
    return {
        BH: "B\"H",
        ok: true,
        service: "Awtsmoos Email",
        linkedTo: "/api/social/mail"
    };
}

module.exports = async $i => {
    const userid = getUserId($i);
    const mailRoutes = createMailRoutes({ $i, userid });
    const emailRoutes = withoutMailPrefix(mailRoutes);

    $i.use({
        "/": async () => ({ ...status(), routes: Object.keys(emailRoutes) }),
        "/email": async () => status(),
        email: async () => status(),
        ...emailRoutes,
        ...mailRoutes
    });
};
