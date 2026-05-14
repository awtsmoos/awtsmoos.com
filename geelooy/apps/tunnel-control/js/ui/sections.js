
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
  const top = makeButton("Top", "section-tool-btn ghost");

  collapse.addEventListener("click", () => {
    section.classList.toggle("is-collapsed");
    collapse.textContent = section.classList.contains("is-collapsed") ? "Expand" : "Collapse";
  });

  top.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  right.append(collapse, top);
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
    const y = window.scrollY + 130;

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

export function mountSections() {
  document.querySelectorAll("section.card, details.card").forEach(wrapCard);
  activeDockOnScroll();
}
