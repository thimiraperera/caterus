/* ============================================================
   Caterus - interactions
   ============================================================ */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Smooth momentum scrolling (Lenis) ---- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),   // easeOutCubic - glides to a stop
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* Smooth in-page navigation (clears the fixed nav with an offset) */
  const scrollToEl = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -84 });
    else target.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (href.length <= 1) return;            // skip bare "#" links
    a.addEventListener("click", (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      scrollToEl(target);
    });
  });

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
    const dur = 3000, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$("[data-count]");
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
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("filter--on"));
      btn.classList.add("filter--on");
      const f = btn.getAttribute("data-f");
      // Re-query each click so dynamically loaded cards are included
      $$("#cat-grid .card").forEach((card) => {
        const tags = (card.getAttribute("data-tags") || "").split(" ");
        card.classList.toggle("hide", f !== "all" && !tags.includes(f));
      });
    });
  });

  /* ---- Search form — navigates to /caterers ---- */
  const form = $("#search-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const loc    = ($("#s-loc").value || "").trim();
      const occ    = $("#s-occ").value;
      const guests = $("#s-guests").value;
      const params = new URLSearchParams();
      if (loc)    params.set("suburb",    loc);
      if (occ)    params.set("occasion",  occ);
      if (guests) params.set("minGuests", guests);
      window.location.href = "/caterers" + (params.toString() ? "?" + params.toString() : "");
    });
  }

  /* ---- Homepage caterers grid pagination ---- */
  const catGrid  = $("#cat-grid");
  const catPager = $("#cat-pager");
  let catPage    = 1;
  let catTotal   = catGrid ? parseInt(catGrid.dataset.total || "0", 10) : 0;
  const CAT_LIMIT = 9;

  function buildPager(current, totalPages) {
    if (!catPager || totalPages <= 1) { if (catPager) catPager.hidden = true; return; }
    catPager.hidden = false;
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - current) <= 1) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    catPager.innerHTML =
      `<button class="pager-btn" data-pg="${current - 1}" ${current <= 1 ? "disabled" : ""} aria-label="Previous">&#8592;</button>` +
      pages.map(p => p === "..."
        ? `<span class="pager-ellipsis">...</span>`
        : `<button class="pager-btn${p === current ? " pager-btn--on" : ""}" data-pg="${p}">${p}</button>`
      ).join("") +
      `<button class="pager-btn" data-pg="${current + 1}" ${current >= totalPages ? "disabled" : ""} aria-label="Next">&#8594;</button>`;

    catPager.querySelectorAll(".pager-btn[data-pg]").forEach((btn) => {
      if (btn.disabled) return;
      btn.addEventListener("click", () => loadCatPage(parseInt(btn.dataset.pg, 10)));
    });
  }

  async function loadCatPage(page) {
    if (!catGrid) return;
    catPage = page;
    const filterEl = $$(".filter--on")[0];
    const activeFilter = filterEl ? filterEl.getAttribute("data-f") : "all";
    const params = new URLSearchParams({ page, limit: CAT_LIMIT, sort: "reviews" });
    if (activeFilter && activeFilter !== "all") params.set("occasion", activeFilter);
    const spinner = '<div style="grid-column:1/-1;padding:3rem;text-align:center;color:var(--muted)">Loading...</div>';
    catGrid.innerHTML = spinner;
    try {
      const data = await fetch("/api/caterers?" + params).then(r => r.json());
      if (data.caterers && data.caterers.length) {
        catGrid.innerHTML = data.caterers.map(renderCatCard).join("");
        $$("[data-reveal]", catGrid).forEach(el => el.classList.add("in"));
      } else {
        catGrid.innerHTML = '<p style="grid-column:1/-1;padding:2rem;color:#8a857a;text-align:center">No caterers found.</p>';
      }
      catTotal = data.total || 0;
      buildPager(catPage, data.totalPages || 1);
      const section = $("#caterers");
      if (section && page > 1) scrollToEl(section);
    } catch (_) {
      catGrid.innerHTML = '<p style="grid-column:1/-1;padding:2rem;color:#8a857a;text-align:center">Could not load caterers.</p>';
    }
  }

  if (catGrid && catPager) {
    const totalPages = Math.ceil(catTotal / CAT_LIMIT);
    buildPager(1, totalPages);
  }

  function escHtml(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function renderCatCard(cat) {
    const tagStr  = "all " + (cat.occasions || []).join(" ");
    const imgSrc  = cat.featured_image ? "/" + cat.featured_image : "/assets/food1.png";
    const rating  = parseFloat(cat.rating_avg || 0).toFixed(1);
    const price   = Math.round(parseFloat(cat.price_from || 0));
    const badge   = cat.is_featured
      ? '<span class="card__badge card__badge--top">★ Top Rated</span>'
      : '<span class="card__badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Vetted</span>';
    const tagBadges = (cat.tags || []).slice(0, 3).map((t) => "<span>" + escHtml(t) + "</span>").join("");
    return `
      <article class="card in" data-tags="${escHtml(tagStr)}">
        <a href="/caterer/${escHtml(cat.slug)}" class="card__img" aria-label="View ${escHtml(cat.business_name)}">
          <img src="${escHtml(imgSrc)}" alt="${escHtml(cat.business_name)} catering" loading="lazy"/>
          ${badge}
        </a>
        <div class="card__body">
          <div class="card__row">
            <h3><a href="/caterer/${escHtml(cat.slug)}">${escHtml(cat.business_name)}</a></h3>
            <span class="card__score">${escHtml(rating)} <small>★</small></span>
          </div>
          <p class="card__sub">${escHtml(cat.suburb)}, Melbourne · ★★★★★ (${escHtml(cat.review_count)})</p>
          <p class="card__desc">${escHtml(cat.tagline || cat.cuisine_type || "")}</p>
          <div class="card__tags">${tagBadges}</div>
          <div class="card__foot">
            <span class="card__price">from <strong>$${price}</strong>/pp</span>
            <a href="/caterer/${escHtml(cat.slug)}" class="btn btn--line btn--sm">View &amp; Book</a>
          </div>
        </div>
      </article>`;
  }

  /* ---- Back to top ---- */
  if (btt) btt.addEventListener("click", scrollToTop);

  /* ---- Modals (contact + caterer registration) ---- */
  // Auto-space phone numbers as typed (e.g. 0412 345 678)
  $$('input[data-phone]').forEach((el) => {
    el.addEventListener("input", () => {
      const d = el.value.replace(/\D/g, "").slice(0, 10);
      el.value = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 10)].filter(Boolean).join(" ");
    });
  });

  const setupModal = (modal) => {
    if (!modal) return null;
    const form = modal.querySelector("form");
    const success = modal.querySelector(".cform__success");
    let lastFocus = null;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const open = () => {
      lastFocus = document.activeElement;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      if (lenis) lenis.stop(); else document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
      const first = modal.querySelector("input, textarea, select");
      setTimeout(() => first && first.focus(), 80);
    };
    function close() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      if (lenis) lenis.start(); else document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (form && success) { form.hidden = false; success.hidden = true; form.reset(); }
      if (lastFocus) lastFocus.focus();
    }
    modal.querySelectorAll("[data-modal-close]").forEach((el) => el.addEventListener("click", close));
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const btn = form.querySelector('button[type="submit"]');
        const origText = btn.textContent;
        btn.disabled = true; btn.textContent = 'Sending…';
        try {
          // Determine endpoint from modal id
          const isRegister = modal.id === 'register-modal';
          const endpoint = isRegister ? '/api/apply' : '/api/contact';
          const fd = new FormData(form);
          const data = {};
          // Map form field names to API field names
          if (isRegister) {
            data.business_name = fd.get('business') || '';
            data.contact_name = fd.get('contactName') || '';
            data.email = fd.get('email') || '';
            data.phone = fd.get('phone') || '';
            data.cuisine = fd.get('cuisine') || '';
            data.service_area = fd.get('area') || '';
          } else {
            data.first_name = fd.get('firstName') || '';
            data.last_name = fd.get('lastName') || '';
            data.email = fd.get('email') || '';
            data.phone = fd.get('phone') || '';
            data.message = fd.get('message') || '';
          }
          if (window.captchaGetToken) {
            try { data.captcha_token = await window.captchaGetToken(isRegister ? 'apply' : 'contact'); } catch (_) {}
          }
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          if (result.success) {
            form.hidden = true;
            if (success) success.hidden = false;
          } else {
            alert(result.error || 'Something went wrong.');
          }
        } catch (err) {
          alert('Network error. Please try again.');
        } finally {
          btn.disabled = false; btn.textContent = origText;
        }
      });
    }
    return { open, close };
  };

  const contactModal = setupModal($("#contact-modal"));
  const registerModal = setupModal($("#register-modal"));
  $$("[data-contact-open]").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); contactModal && contactModal.open(); })
  );
  $$("[data-register-open]").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); registerModal && registerModal.open(); })
  );

  /* ---- Occasions: scroll-linked horizontal carousel ---- */
  const pin = $("#occ-pin");
  const track = $("#occ-track");
  const canPin = window.matchMedia("(min-width: 761px)").matches &&
                 !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (pin && track && canPin) {
    let overflow = 0, targetX = 0, currentX = 0, running = false;

    const updateTarget = () => {
      const max = pin.offsetHeight - window.innerHeight;
      let prog = max > 0 ? Math.min(Math.max(-pin.getBoundingClientRect().top / max, 0), 1) : 0;
      prog = prog * prog * (3 - 2 * prog);   // smoothstep - eases in at the start, out at the end
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
      // Eased follow → starts gently, glides to a slow stop
      currentX += (targetX - currentX) * 0.085;
      if (Math.abs(targetX - currentX) < 0.3) currentX = targetX;
      track.style.transform = `translate3d(${currentX}px,0,0)`;
      running = Math.abs(targetX - currentX) > 0.05;
      if (running) requestAnimationFrame(loop);
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
    const onMove = () => { updateTarget(); kick(); };

    if (lenis) lenis.on("scroll", onMove);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();

    /* ---- Auto-scroll when hovering the left / right edge ---- */
    const viewport = pin.querySelector(".occ-viewport");
    const EDGE = 0.15;      // hot-zone = 15% of width on each side
    const SPEED = 11;       // px per frame
    let edgeDir = 0;        // -1 = left, +1 = right, 0 = none

    if (viewport) {
      viewport.addEventListener("mousemove", (e) => {
        const r = viewport.getBoundingClientRect();
        const x = e.clientX - r.left;
        edgeDir = x < r.width * EDGE ? -1 : x > r.width * (1 - EDGE) ? 1 : 0;
        viewport.style.cursor = edgeDir === 1 ? "e-resize" : edgeDir === -1 ? "w-resize" : "";
      });
      viewport.addEventListener("mouseleave", () => { edgeDir = 0; viewport.style.cursor = ""; });

      const edgeLoop = () => {
        if (edgeDir !== 0) {
          const top = pin.getBoundingClientRect().top + window.scrollY;
          const range = pin.offsetHeight - window.innerHeight;
          let next = window.scrollY + edgeDir * SPEED;
          next = Math.min(Math.max(next, top), top + range);   // stay within the pin
          if (lenis) lenis.scrollTo(next, { immediate: true });
          else window.scrollTo(0, next);
          updateTarget(); kick();
        }
        requestAnimationFrame(edgeLoop);
      };
      requestAnimationFrame(edgeLoop);
    }
  }

  /* ---- Caterer page: booking panel (stepper UI only — submit handled by caterer.ejs inline script) ---- */
})();
