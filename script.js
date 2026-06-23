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
  if (!thumbs || !document.getElementById("brandImage")) return; // stale cached HTML without gallery markup
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

// ---- Language toggle (DE default / EN) ----
// Static page text is written in German; this dictionary swaps it to English
// when EN is chosen. The choice is shared across all pages via localStorage.
const I18N = {
  "nav.weare":  { de: "Über uns", en: "We Are" },
  "nav.dates":  { de: "Termine",  en: "Dates" },
  "nav.brands": { de: "Marken",   en: "Brands" },

  "footer.contact": { de: "Kontakt",     en: "Contact us" },
  "footer.imprint": { de: "Impressum",   en: "Imprint" },
  "footer.privacy": { de: "Datenschutz", en: "Privacy Policy" },
  "footer.terms":   { de: "AGB",         en: "Terms & Conditions" },

  "insta.line": { de: "Folgt uns auf Instagram", en: "Follow Us On Instagram" },

  "brand.p1": {
    de: "Platzhaltertext. Stellen Sie hier die Marke vor – ihre Gründerin oder ihren Gründer, das Gründungsjahr und die Idee dahinter. Zwei, drei Sätze geben den Ton an, bevor es ins Detail geht.",
    en: "Placeholder copy. Introduce the brand here — its founder, the year it started, and the idea behind it. Two or three sentences set the tone before going into detail.",
  },
  "brand.p2": {
    de: "Platzhaltertext. Beschreiben Sie die Kollektionen: die Materialien, die Kategorien, die gestalterische Handschrift, die die Marke unverwechselbar macht, und wo die Stücke gefertigt werden.",
    en: "Placeholder copy. Describe the collections: the materials, the categories, the design signature that makes the brand recognizable, and where the pieces are produced.",
  },
  "brand.p3": {
    de: "Platzhaltertext. Schließen Sie mit einem Satz darüber, für wen die Marke gedacht ist und warum sie in die Auswahl des Showrooms gehört.",
    en: "Placeholder copy. Close with a line about who the brand is for and why it belongs in the showroom selection.",
  },

  "dates.d1.time":  { de: "22.–26. Jun 2026", en: "22–26 Jun 2026" },
  "dates.d1.title": { de: "Frühjahr/Sommer 27 — Pre-Collection", en: "Spring/Summer 27 — Pre-Collection" },
  "dates.d2.time":  { de: "06.–10. Jul 2026", en: "06–10 Jul 2026" },
  "dates.d2.title": { de: "Frühjahr/Sommer 27 — Herrenmode", en: "Spring/Summer 27 — Menswear" },
  "dates.d3.time":  { de: "14.–18. Sep 2026", en: "14–18 Sep 2026" },
  "dates.d3.title": { de: "Frühjahr/Sommer 27 — Hauptkollektion", en: "Spring/Summer 27 — Main Collection" },
  "dates.d4.time":  { de: "05.–09. Okt 2026", en: "05–09 Oct 2026" },
  "dates.d4.title": { de: "Frühjahr/Sommer 27 — Accessoires", en: "Spring/Summer 27 — Accessories" },
  "where.appointment": { de: "Showroom — Nach Vereinbarung", en: "Showroom — By appointment" },
  "where.offsite":     { de: "Extern — Details auf Anfrage", en: "Off-site — Details on request" },

  "about.p1": {
    de: "Die Agentur wurde im Jahr 2010 von Gabi Heininger gegründet und wird von einem kleinen engagierten Team unterstützt.",
    en: "The agency was founded in 2010 by Gabi Heininger and is supported by a small, dedicated team.",
  },
  "about.p2": {
    de: "Wir haben Showrooms in München und Düsseldorf und vertreten ausgewählte Premium- und Luxus Brands im deutschen und österreichischen Markt.",
    en: "We have showrooms in Munich and Düsseldorf and represent selected premium and luxury brands in the German and Austrian markets.",
  },
  "about.p3": {
    de: "Unser Portfolio umfasst Schuhe, Taschen und Accessoires. Die Leidenschaft der Agentur gilt dem Besonderen – Produkte mit edgy Style, die eine Geschichte erzählen.",
    en: "Our portfolio comprises shoes, bags, and accessories. The agency's passion is for the exceptional — products with edgy style that tell a story.",
  },
  "about.p4": {
    de: "Im Mittelpunkt stehen Familienunternehmen, junge und traditionsreiche Manufakturen mit besonderen Produkten, deren Anspruch an Qualität, Design und Verarbeitung, höchsten Maßstäben entspricht.",
    en: "At the heart of it are family businesses, young and long-established workshops with distinctive products whose standards of quality, design, and craftsmanship meet the highest benchmarks.",
  },
  "about.p5": {
    de: "Wir legen großen Wert auf langfristige Partnerschaften, sowohl mit unseren Marken, als auch mit unseren Handelspartnern.",
    en: "We place great value on long-term partnerships, both with our brands and with our retail partners.",
  },
  "about.p6": {
    de: "Vertrauen, Kontinuität und ein gemeinsames Marktverständnis bilden den Kern unserer Arbeitsweise – stets mit dem Ziel, gemeinsam ein gesundes und nachhaltiges Wachstum zu erzielen.",
    en: "Trust, continuity, and a shared understanding of the market form the core of how we work — always with the goal of achieving healthy, sustainable growth together.",
  },
  "about.p7": { de: "We love what we do……", en: "We love what we do……" },
};

function applyLang(lang) {
  if (lang !== "de" && lang !== "en") lang = "de";
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const entry = I18N[el.dataset.i18n];
    if (entry && entry[lang] != null) el.textContent = entry[lang];
  });
  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  try { localStorage.setItem("lang", lang); } catch (e) {}
}

document.querySelectorAll("[data-lang]").forEach((b) => {
  b.addEventListener("click", () => applyLang(b.dataset.lang));
});

let savedLang = "de";
try { savedLang = localStorage.getItem("lang") || "de"; } catch (e) {}
applyLang(savedLang);
