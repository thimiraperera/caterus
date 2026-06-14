/* ============================================================
   Caterus — interactions
   ============================================================ */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---- Sticky nav + back-to-top ---- */
  const nav = $("#nav");
  const btt = $("#btt");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 24);
    if (btt) { btt.hidden = false; btt.classList.toggle("show", window.scrollY > 600); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const ham = $("#ham");
  const mob = $("#mob");
  if (ham && mob) {
    const toggle = (open) => {
      const willOpen = open ?? mob.hidden;
      mob.hidden = !willOpen;
      ham.classList.toggle("open", willOpen);
      nav.classList.toggle("show-mob", willOpen);
      ham.setAttribute("aria-expanded", String(willOpen));
    };
    ham.addEventListener("click", () => toggle());
    $$("#mob a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = $$("[data-reveal], [data-slide-left], [data-slide-right]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
        setTimeout(() => el.classList.add("in"), delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---- Animated counters ---- */
  const fmt = (n) => n.toLocaleString("en-AU");
  const runCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const dur = 1600, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$(".stat__n");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ---- Caterer filters ---- */
  const filters = $$(".filter");
  const cards = $$("#cat-grid .card");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("filter--on"));
      btn.classList.add("filter--on");
      const f = btn.getAttribute("data-f");
      cards.forEach((card) => {
        const tags = (card.getAttribute("data-tags") || "").split(" ");
        card.classList.toggle("hide", f !== "all" && !tags.includes(f));
      });
    });
  });

  /* ---- Search form (no backend yet) ---- */
  const form = $("#search-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const t = $("#caterers");
      if (t) t.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---- Back to top ---- */
  if (btt) btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---- Occasions: scroll-linked horizontal carousel ---- */
  const pin = $("#occ-pin");
  const track = $("#occ-track");
  const canPin = window.matchMedia("(min-width: 761px)").matches &&
                 !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (pin && track && canPin) {
    let overflow = 0, targetX = 0, currentX = 0, running = false;

    const updateTarget = () => {
      const max = pin.offsetHeight - window.innerHeight;
      const prog = max > 0 ? Math.min(Math.max(-pin.getBoundingClientRect().top / max, 0), 1) : 0;
      targetX = -prog * overflow;
    };

    const measure = () => {
      overflow = Math.max(0, track.scrollWidth - window.innerWidth);
      // Vertical scroll distance == horizontal overflow → natural 1:1 feel
      pin.style.height = window.innerHeight + overflow + "px";
      updateTarget();
      currentX = targetX;
      track.style.transform = `translate3d(${currentX}px,0,0)`;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.12;          // ease toward target
      if (Math.abs(targetX - currentX) < 0.4) currentX = targetX;
      track.style.transform = `translate3d(${currentX}px,0,0)`;
      running = Math.abs(targetX - currentX) > 0.01;
      if (running) requestAnimationFrame(loop);
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

    window.addEventListener("scroll", () => { updateTarget(); kick(); }, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();
  }
})();
