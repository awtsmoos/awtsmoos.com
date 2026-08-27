//B"H
/**
 * @file visionDemo.js
 * @brief Optional demo transcript for visual verification only.
 *
 * Chapter 16: The demo mirror learned patience. The main app may repaint the
 * chat during boot, so the mirror watches briefly and restores itself only when
 * the explicit `awtsmoosVisionDemo=1` seal is present.
 */

const DEMO_QUERY = "awtsmoosVisionDemo";

/** B"H. Mounts a visual-only demo transcript when explicitly requested. */
export function mountVisionDemo() {
  const params = new URLSearchParams(location.search);
  if (params.get(DEMO_QUERY) !== "1") return;
  const chat = document.getElementById("chat-box");
  if (!chat) return;
  applyDemo(chat);
  let ticks = 0;
  const observer = new MutationObserver(() => {
    if (ticks++ > 12) return observer.disconnect();
    if (!chat.querySelector(".vision-demo-message")) applyDemo(chat);
  });
  observer.observe(chat, { childList: true });
  setTimeout(() => observer.disconnect(), 5000);
}

function applyDemo(chat) {
  chat.dataset.visionDemoMounted = "1";
  chat.innerHTML = demoMarkup();
}

function demoMarkup() {
  return `<article class="message user-message vision-demo-message">
      <div>write a poem about the awtsmoos revealing itself in every atom of reality</div>
      <time>9:41 AM ✓✓</time>
    </article>
    <article class="message assistant-message vision-demo-message">
      <div class="vision-demo-icon">✺</div>
      <div>
        <p>From nothing, yet everything,<br>The Awtsmoos breathes, infinite King.<br>In every spark, in every atom small,<br>He hides, reveals, sustains it all.</p>
        <p>No place is void, no moment lost,<br>Each instant re-created, no matter the cost.<br>Through word, through light, through whispers unseen,<br>The Awtsmoos is, has always been.</p>
      </div>
    </article>`;
}
