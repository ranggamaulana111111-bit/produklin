import { product } from "./products.js";

const SHOPEE = "https://shopee.co.id/universal-link?redir=https%3A%2F%2Fid.shp.ee%2F7pl68alf&smtt=0.0.3";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector("#site-header");
const menuTrigger = document.querySelector("#menu-trigger");
const siteNav = document.querySelector("#site-nav");
const productGrid = document.querySelector("#product-grid");
const dialog = document.querySelector("#product-dialog");
const dialogClose = document.querySelector("#product-dialog-close");
const dialogKicker = document.querySelector("#product-dialog-kicker");
const dialogTitle = document.querySelector("#product-dialog-title");
const dialogPrice = document.querySelector("#product-dialog-price");
const dialogDesc = document.querySelector("#product-dialog-desc");
const dialogMaterial = document.querySelector("#product-dialog-material");
const dialogSize = document.querySelector("#product-dialog-size");
const dialogCta = document.querySelector("#product-dialog-cta");
const newsletter = document.querySelector("#newsletter-form");
const newsletterEmail = document.querySelector("#newsletter-email");
const toast = document.querySelector("#toast");

let navOpen = false;
let lastFocus = null;
let toastTimer = 0;

function syncLock() {
  document.body.classList.toggle("is-locked", navOpen || dialog.open);
}

function setNav(open) {
  navOpen = open;
  document.body.classList.toggle("nav-open", open);
  menuTrigger.setAttribute("aria-expanded", String(open));
  menuTrigger.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
  syncLock();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function openProduct() {
  lastFocus = document.activeElement;
  dialogKicker.textContent = "Viscose Bamboo";
  dialogTitle.textContent = product.name;
  dialogPrice.textContent = product.priceLabel;
  dialogDesc.textContent = product.description;
  dialogMaterial.textContent = product.material;
  dialogSize.textContent = product.size;
  dialogCta.href = SHOPEE;

  if (!dialog.open) {
    dialog.showModal();
    syncLock();
  }
}

function initHeader() {
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(y / max, 1) : 0;

    header.classList.toggle("is-scrolled", y > 12);
    header.style.setProperty("--scroll-progress", progress.toFixed(4));
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
}

function initNav() {
  menuTrigger.addEventListener("click", () => setNav(!navOpen));

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setNav(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navOpen) setNav(false);
  });

  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches && navOpen) setNav(false);
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("reveal--armed", "is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
  );

  items.forEach((item) => {
    item.classList.add("reveal--armed");
    observer.observe(item);
  });
}

function initDialog() {
  productGrid.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-product]")) openProduct();
  });

  dialogClose.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    syncLock();
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  });
}

function initNewsletter() {
  newsletter.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!newsletterEmail.validity.valid) {
      showToast("Mohon masukkan alamat email yang sah.");
      newsletterEmail.focus();
      return;
    }

    newsletter.reset();
    showToast("Terima kasih. Kabar dari lins_official akan dikirim secukupnya.");
  });
}

initHeader();
initNav();
initReveal();
initDialog();
initNewsletter();

const veilCanvas = document.querySelector("#silk-veil");
if (veilCanvas) {
  import("./silk-veil.js")
    .then(({ initSilkVeil }) => initSilkVeil(veilCanvas))
    .catch(() => veilCanvas.classList.add("is-unavailable"));
}
