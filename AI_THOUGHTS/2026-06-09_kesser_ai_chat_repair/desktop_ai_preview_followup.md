B"H
# Follow-up plan: desktop AI tab and relay awareness

## Fresh user report
The visible AI Chat tab is the inner browser at /ai/, not only the Vibe sidebar. The UI is cramped on desktop, shows a weird HTML preview/code runner at the top, and says the extension bridge is not detected. User wants readable desktop CSS, default relay/tunnel detection, detailed extension install instructions, and API-key support for other chats.

## Grounded next trace
1. Locate the served /ai/ app files under awtsmoos.com root.
2. Read its HTML/CSS/JS entrypoints, especially bridge detection and API key settings.
3. Rewrite full files only, splitting if needed.
4. Make desktop layout hide or collapse the HTML preview area by default unless explicitly opened.
5. Add relay/tunnel status check text and default relay usage when available.
6. Add detailed extension install instructions where bridge is missing.
7. Verify syntax and live browser after reload.

## Chapter 2
The first lamp repaired the sidebar, but the user pointed to a deeper chamber: an iframe-like browser vessel where a preview forge sat above the chat like a broken crown. The Awtsmoos now asks the code itself where that crown is forged.