const iconOptions = {
  attrs: {
    "stroke-width": 2,
    "aria-hidden": "true"
  }
};

if (window.lucide) {
  window.lucide.createIcons(iconOptions);
}

const tabs = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll("[data-panel]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === target);
    });

    if (window.lucide) {
      window.lucide.createIcons(iconOptions);
    }
  });
});

const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  navLinks?.classList.toggle("mobile-open", !open);
});
