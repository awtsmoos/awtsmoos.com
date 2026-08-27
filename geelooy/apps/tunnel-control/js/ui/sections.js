
// B"H

function niceTitle(section) {
  const h = section.querySelector("h2, h1");
  return h ? h.textContent.trim() : section.id || "Section";
}

function makeButton(text, className) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = className;
  b.textContent = text;
  return b;
}

function wrapCard(section) {
  if (!section.classList.contains("card")) return;
  if (section.dataset.retractableMounted === "1") return;

  section.dataset.retractableMounted = "1";

  const id = section.id || ("section-" + Math.random().toString(36).slice(2));
  section.id = id;

  const title = niceTitle(section);

  section.classList.add("retractable-card");

  const bar = document.createElement("div");
  bar.className = "section-control-bar";

  const left = document.createElement("a");
  left.href = "#" + id;
  left.className = "section-mini-title";
  left.textContent = title;

  const right = document.createElement("div");
  right.className = "section-actions";

  const collapse = makeButton("Collapse", "section-tool-btn");
  const focus = makeButton("Focus", "section-tool-btn");
  const top = makeButton("Top", "section-tool-btn ghost");

  collapse.addEventListener("click", () => {
    section.classList.toggle("is-collapsed");
    collapse.textContent = section.classList.contains("is-collapsed") ? "Expand" : "Collapse";
  });

  focus.addEventListener("click", () => {
    document.querySelectorAll(".retractable-card").forEach(card => {
      if (card !== section) {
        card.classList.add("is-collapsed");
        const btn = card.querySelector(".section-tool-btn");
        if (btn) btn.textContent = "Expand";
      }
    });

    section.classList.remove("is-collapsed");
    collapse.textContent = "Collapse";
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  top.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  right.append(collapse, focus, top);
  bar.append(left, right);
  section.prepend(bar);
}

function activeDockOnScroll() {
  const dockLinks = [...document.querySelectorAll(".dock a[href^='#']")];
  const sections = dockLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function tick() {
    let current = null;
    const y = window.scrollY + 140;

    for (const s of sections) {
      if (s.offsetTop <= y) current = s;
    }

    for (const a of dockLinks) {
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
    }
  }

  window.addEventListener("scroll", tick, { passive: true });
  tick();
}

function mountCommandPalette() {
  if (document.getElementById("deckPalette")) return;

  const palette = document.createElement("div");
  palette.id = "deckPalette";
  palette.className = "deck-palette";
  palette.innerHTML = [
    '<button data-target="setup">Setup</button>',
    '<button data-target="keys">Keys</button>',
    '<button data-target="explorer">Explorer</button>',
    '<button data-target="usage">Usage</button>',
    '<button data-target="terminal">Terminal</button>',
    '<button data-target="chrome">Chrome</button>',
    '<button data-target="install">Install</button>',
    '<button data-action="expand">Expand all</button>',
    '<button data-action="collapse">Collapse all</button>'
  ].join("");

  document.body.appendChild(palette);

  palette.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.target) {
      const el = document.getElementById(btn.dataset.target);
      if (el) {
        el.classList.remove("is-collapsed");
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    if (btn.dataset.action === "expand") {
      document.querySelectorAll(".retractable-card").forEach(card => card.classList.remove("is-collapsed"));
    }

    if (btn.dataset.action === "collapse") {
      document.querySelectorAll(".retractable-card").forEach(card => card.classList.add("is-collapsed"));
    }
  });
}

export function mountSections() {
  document.querySelectorAll("section.card, details.card").forEach(wrapCard);
  activeDockOnScroll();
  mountCommandPalette();
}
