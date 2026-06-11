// ---- Brand data: edit this list to change tiles, menus and brand pages ----
const BRANDS = [
  { slug: "atelier-novella", name: "Atelier Novella", seed: "tile01" },
  { slug: "bruno-marek", name: "Bruno Marek", seed: "tile02" },
  { slug: "casa-lumen", name: "Casa Lumen", seed: "tile03" },
  { slug: "delft-daughters", name: "Delft & Daughters", seed: "tile04" },
  { slug: "eastfield", name: "Eastfield", seed: "tile05" },
  { slug: "ferand", name: "Férand", seed: "tile06" },
  { slug: "grau-studio", name: "Grau Studio", seed: "tile07" },
  { slug: "grau-studio-men", name: "Grau Studio Men", seed: "tile08" },
  { slug: "hollis-co", name: "Hollis & Co", seed: "tile09" },
  { slug: "ines-marlowe", name: "Ines Marlowe", seed: "tile10" },
  { slug: "junipero", name: "Junipero", seed: "tile11" },
  { slug: "kessler-knits", name: "Kessler Knits", seed: "tile12" },
  { slug: "lindqvist", name: "Lindqvist", seed: "tile13" },
  { slug: "mirelle", name: "Mirelle", seed: "tile14" },
  { slug: "north-vale", name: "North & Vale", seed: "tile15" },
  { slug: "oro-bianco", name: "Oro Bianco", seed: "tile16" },
  { slug: "petra-lund", name: "Petra Lund", seed: "tile17" },
  { slug: "quill", name: "Quill", seed: "tile18" },
  { slug: "rovere", name: "Rovere", seed: "tile19" },
];

function brandImage(brand) {
  // Replace with your own image per brand, e.g. `images/${brand.slug}.jpg`
  return `https://picsum.photos/seed/${brand.seed}/600/1020`;
}

function brandGalleryImages(brand) {
  // Replace with your own photos per brand, e.g. images/<slug>/1.jpg ... 4.jpg
  return [
    brandImage(brand),
    `https://picsum.photos/seed/${brand.seed}-2/600/1020`,
    `https://picsum.photos/seed/${brand.seed}-3/600/1020`,
    `https://picsum.photos/seed/${brand.seed}-4/600/1020`,
  ];
}

// ---- Tile grid (homepage + brands page) ----
const tileGrid = document.getElementById("tileGrid");
if (tileGrid) {
  tileGrid.innerHTML = BRANDS.map(
    (b) => `
    <div class="tile-col">
      <div class="collection-item">
        <div class="image-wrap">
          <a href="#${b.slug}">
            <div class="background-box" style="background-image: url('${brandImage(b)}');"></div>
            <div class="caption">${b.name}</div>
          </a>
        </div>
      </div>
    </div>`
  ).join("");
}

// ---- Sidebar brand links ----
const sidebarBrands = document.getElementById("sidebarBrands");
if (sidebarBrands) {
  sidebarBrands.innerHTML = BRANDS.map(
    (b) => `<a href="brands.html#${b.slug}" class="level-2">${b.name}</a>`
  ).join("");
}

// ---- Hash router: grid <-> brand views cross-fade on one page ----
const viewGrid = document.getElementById("viewGrid");
const viewBrand = document.getElementById("viewBrand");
const siteFooter = document.getElementById("siteFooter");
const FADE_MS = 250;

function currentBrand() {
  const slug = decodeURIComponent(location.hash.replace(/^#/, ""));
  return BRANDS.find((b) => b.slug === slug) || null;
}

function fillBrand(brand) {
  document.getElementById("brandTitle").textContent = brand.name;
  document.getElementById("brandList").innerHTML = BRANDS.map(
    (b) =>
      `<a href="#${b.slug}" class="${b.slug === brand.slug ? "current" : ""}">${b.name}</a>`
  ).join("");
  setupGallery(brand);
}

// ---- Brand photo gallery (arrows + thumbnail row) ----
let galleryImages = [];
let galleryIndex = 0;

function setGalleryImage(i, fade) {
  const main = document.getElementById("brandImage");
  galleryIndex = (i + galleryImages.length) % galleryImages.length;

  const swap = () => {
    main.style.backgroundImage = `url('${galleryImages[galleryIndex]}')`;
    main.classList.remove("img-fading");
  };
  if (fade) {
    main.classList.add("img-fading");
    setTimeout(swap, 150);
  } else {
    swap();
  }

  document.querySelectorAll("#galleryThumbs .thumb").forEach((t, ti) => {
    t.classList.toggle("active", ti === galleryIndex);
  });
}

function setupGallery(brand) {
  galleryImages = brandGalleryImages(brand);
  const thumbs = document.getElementById("galleryThumbs");
  thumbs.innerHTML = galleryImages
    .map(
      (src, i) =>
        `<button class="thumb" style="background-image: url('${src}')" aria-label="Image ${i + 1}"></button>`
    )
    .join("");
  thumbs.querySelectorAll(".thumb").forEach((t, i) => {
    t.addEventListener("click", () => setGalleryImage(i, true));
  });
  setGalleryImage(0, false);
}

const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");

if (galleryPrev && galleryNext) {
  galleryPrev.addEventListener("click", () => setGalleryImage(galleryIndex - 1, true));
  galleryNext.addEventListener("click", () => setGalleryImage(galleryIndex + 1, true));

  document.addEventListener("keydown", (e) => {
    if (!viewBrand || viewBrand.hidden) return;
    if (e.key === "ArrowLeft") setGalleryImage(galleryIndex - 1, true);
    if (e.key === "ArrowRight") setGalleryImage(galleryIndex + 1, true);
  });

  // Swipe on touch screens
  const galleryMain = document.querySelector(".gallery-main");
  let touchX = null;
  galleryMain.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  galleryMain.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) setGalleryImage(galleryIndex + (dx < 0 ? 1 : -1), true);
    touchX = null;
  }, { passive: true });
}

function applyRoute(fade) {
  const brand = currentBrand();
  const show = brand ? viewBrand : viewGrid;
  const hide = brand ? viewGrid : viewBrand;

  const finish = () => {
    if (brand) fillBrand(brand);
    if (siteFooter) siteFooter.hidden = !!brand; // no "Contact us" on the brand view
    hide.hidden = true;
    hide.classList.remove("fading");
    show.hidden = false;
    show.classList.add("fading");
    window.scrollTo(0, 0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => show.classList.remove("fading"))
    );
  };

  if (!fade) {
    if (brand) fillBrand(brand);
    if (siteFooter) siteFooter.hidden = !!brand;
    hide.hidden = true;
    show.hidden = false;
    return;
  }

  // Fade out whatever is visible (covers brand -> brand too), then swap.
  const visible = viewBrand.hidden ? viewGrid : viewBrand;
  visible.classList.add("fading");
  setTimeout(finish, FADE_MS);
}

if (viewGrid && viewBrand) {
  applyRoute(false);
  window.addEventListener("hashchange", () => applyRoute(true));
}

// ---- Mobile sidebar (slides in from the right) ----
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebarClose");
const backdrop = document.getElementById("backdrop");

function setSidebar(open) {
  sidebar.classList.toggle("open", open);
  backdrop.classList.toggle("show", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => setSidebar(!sidebar.classList.contains("open")));
  sidebarClose.addEventListener("click", () => setSidebar(false));
  backdrop.addEventListener("click", () => setSidebar(false));
  sidebar.addEventListener("click", (e) => {
    if (e.target.closest("a")) setSidebar(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSidebar(false);
  });
}

// ---- Footer "Contact us" expand/collapse ----
const footerToggle = document.getElementById("footerToggle");

if (siteFooter && footerToggle) {
  footerToggle.addEventListener("click", () => {
    const open = siteFooter.classList.toggle("open");
    footerToggle.setAttribute("aria-expanded", String(open));
    if (open) siteFooter.scrollIntoView({ behavior: "smooth", block: "end" });
  });
}
