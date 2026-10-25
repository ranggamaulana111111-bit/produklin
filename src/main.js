import { product } from "./products.js";

const IG_DM = "https://ig.me/m/lins_official";
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
  dialogKicker.textContent = "Daily Collection";
  dialogTitle.textContent = product.name;
  dialogPrice.textContent = product.priceLabel;
  dialogDesc.textContent = product.description;
  dialogMaterial.textContent = product.material;
  dialogSize.textContent = product.size;
  dialogCta.href = IG_DM;

  if (!dialog.open) {
    dialog.showModal();
    syncLock();
  }
}

function initHeader() {
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  update();
  window.addEventListener("scroll", update, { passive: true });
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
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
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
