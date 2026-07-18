// Sticky header shrink on scroll
window.addEventListener('scroll', () => {
  document.getElementById('main-header').classList.toggle('header-scrolled', window.scrollY > 55);
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn  = document.getElementById('close-menu-btn');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks   = document.querySelectorAll('.mobile-link');

  const toggleMenu = () => {
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : 'auto';
  };

  mobileMenuBtn.addEventListener('click', toggleMenu);
  closeMenuBtn.addEventListener('click', toggleMenu);
  mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));



  // --- Product Rendering & Advanced Filtering Logic ---
  const featuredGrid    = document.getElementById('featured-products-grid');
  const catalogGrid     = document.getElementById('main-products-grid');
  const filtersContainer = document.getElementById('catalog-filters');
  const searchInput     = document.getElementById('catalog-search');
  const sortSelect      = document.getElementById('catalog-sort');
  const loadMoreBtn     = document.getElementById('load-more-btn');
  const catalogCounter  = document.getElementById('catalog-counter');

  let allProducts      = [];
  let filteredProducts = [];
  let currentLimit     = 12;
  const ITEMS_PER_PAGE = 12;

  function buildCard(p) {
    const card = document.createElement('div');
    card.className = 'product-card reveal-on-scroll';
    card.setAttribute('data-category', p.category.toLowerCase());

    // Ficha técnica SOLO para Refrigerantes
    let downloadHtml = '';
    if (p.category.toLowerCase() === 'refrigerantes') {
      if (p.pdf) {
        downloadHtml = `
          <div class="product-action mt-15">
            <a href="${p.pdf}" target="_blank" class="btn btn-outline btn-small w-100" style="display:flex;justify-content:center;align-items:center;gap:8px;">
              <i class="fa-solid fa-file-pdf"></i> Ver ficha técnica
            </a>
          </div>`;
      } else {
        downloadHtml = `
          <div class="product-action mt-15">
            <button class="btn btn-outline btn-small w-100" style="display:flex;justify-content:center;align-items:center;gap:8px;opacity:.55;cursor:not-allowed;border-color:#aaa;color:#555;background:#fafafa;" disabled title="Consulte especificaciones con su asesor.">
              <i class="fa-solid fa-circle-question"></i> Consultar ficha técnica
            </button>
          </div>`;
      }
    }

    card.innerHTML = `
      <div class="product-img lb-trigger" data-img="${p.image}" data-name="${p.nombre}">
        <img src="${p.image}" alt="${p.alt}" loading="lazy"${p.imgZoom ? ' class="img-zoomed"' : ''}>
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category === 'Carcare' ? 'Car Care' : p.category === 'Químicos de Taller' ? 'Taller' : p.category}</span>
        <h4 class="product-name">${p.nombre}</h4>
        <p class="product-size">Calidad MAXIMUM</p>
        ${downloadHtml}
      </div>
    `;
    return card;
  }

  function renderFeatured() {
    if (!featuredGrid) return;
    featuredGrid.innerHTML = '';
    const featured = allProducts.filter(p => p.featured).slice(0, 4);
    featured.forEach(p => featuredGrid.appendChild(buildCard(p)));
    initScrollReveal();
  }

  function updateCatalogUI() {
    if (!catalogGrid) return;
    const sliced = filteredProducts.slice(0, currentLimit);
    catalogGrid.innerHTML = '';
    sliced.forEach(p => catalogGrid.appendChild(buildCard(p)));

    const total   = filteredProducts.length;
    const showing = sliced.length;
    catalogCounter.innerText = `Mostrando ${showing} de ${total} productos`;
    loadMoreBtn.style.display = showing >= total ? 'none' : 'inline-flex';
    initScrollReveal();
  }

  function applyFiltersAndSort() {
    const searchTerm    = searchInput.value.toLowerCase().trim();
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const filterValue   = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const sortValue     = sortSelect.value;

    const categoryMap = {
      taller:          ['químicos de taller', 'accesorios', 'frenos', 'agua pura'],
      otros:           ['otros'],
      presentaciones:  ['presentaciones'],
    };

    filteredProducts = allProducts.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm) || p.descripcion.toLowerCase().includes(searchTerm);
      let matchCategory;
      if (filterValue === 'all') {
        matchCategory = true;
      } else if (categoryMap[filterValue]) {
        matchCategory = categoryMap[filterValue].includes(p.category.toLowerCase());
      } else {
        matchCategory = p.category.toLowerCase() === filterValue;
      }
      return matchSearch && matchCategory;
    });

    filteredProducts.sort((a, b) => {
      if (sortValue === 'az') return a.nombre.localeCompare(b.nombre);
      if (sortValue === 'za') return b.nombre.localeCompare(a.nombre);
      if (sortValue === 'category') return a.category.localeCompare(b.category);
      if (a.orderPriority !== b.orderPriority) return a.orderPriority - b.orderPriority;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.nombre.localeCompare(b.nombre);
    });

    currentLimit = ITEMS_PER_PAGE;
    updateCatalogUI();
  }

  function initCatalog() {
    if (!window.MAXIMUM_PRODUCTS) return;
    allProducts = window.MAXIMUM_PRODUCTS.filter(p => p.status === 'valid');
    allProducts.sort((a, b) => {
      if (a.orderPriority !== b.orderPriority) return a.orderPriority - b.orderPriority;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.nombre.localeCompare(b.nombre);
    });

    renderFeatured();

    const fixedFilters = [
      { label: 'Refrigerantes',  filter: 'refrigerantes' },
      { label: 'Taller',         filter: 'taller' },
      { label: 'Grasas',         filter: 'grasas' },
      { label: 'Car Care',       filter: 'carcare' },
      { label: 'Presentaciones', filter: 'presentaciones' },
      { label: 'Otros',          filter: 'otros' },
    ];

    if (filtersContainer && filtersContainer.children.length === 1) {
      fixedFilters.forEach(({ label, filter }) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', filter);
        btn.innerText = label;
        filtersContainer.appendChild(btn);
      });
    }

    const allFilterBtns = document.querySelectorAll('.filter-btn');
    allFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        allFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFiltersAndSort();
      });
    });

    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
    if (sortSelect)  sortSelect.addEventListener('change', applyFiltersAndSort);
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        currentLimit += ITEMS_PER_PAGE;
        updateCatalogUI();
      });
    }

    applyFiltersAndSort();
  }

  initCatalog();
  initScrollReveal();

  // Province modal event listeners
  const provinceModal      = document.getElementById('province-modal');
  const provinceModalClose = document.getElementById('province-modal-close');
  if (provinceModal && provinceModalClose) {
    provinceModalClose.addEventListener('click', closeProvinceModal);
    provinceModal.addEventListener('click', e => {
      if (e.target === provinceModal) closeProvinceModal();
    });
  }

  // Map tab switching
  const mapTabBtns     = document.querySelectorAll('.map-tab-btn');
  const peruMapEl      = document.getElementById('peru-map-container');
  const worldMapEl     = document.getElementById('world-map-container');

  mapTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mapTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mapType = btn.dataset.map;
      if (mapType === 'peru') {
        if (peruMapEl)  peruMapEl.style.display  = 'block';
        if (worldMapEl) worldMapEl.style.display  = 'none';
      } else {
        if (peruMapEl)  peruMapEl.style.display  = 'none';
        if (worldMapEl) worldMapEl.style.display  = 'block';
        if (typeof am5 !== 'undefined') initWorldMap();
      }
    });
  });

  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href').length > 1) {
        e.preventDefault();
        const targetEl = document.getElementById(this.getAttribute('href').substring(1));
        if (targetEl) {
          window.scrollTo({ top: targetEl.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
        }
      }
    });
  });

  // Hero Carousel Logic
  const track     = document.getElementById('carousel-track');
  const slides    = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots      = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn   = document.getElementById('prevSlide');
  const nextBtn   = document.getElementById('nextSlide');
  let currentSlide = 0;
  let slideInterval;

  if (track && slides.length > 0) {
    const showSlide = n => {
      dots.forEach(dot => dot.classList.remove('active'));
      currentSlide = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    };
    const nextSlideFunc = () => showSlide(currentSlide + 1);
    const prevSlideFunc = () => showSlide(currentSlide - 1);
    const startAutoPlay = () => { clearInterval(slideInterval); slideInterval = setInterval(nextSlideFunc, 6500); };

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlideFunc(); startAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlideFunc(); startAutoPlay(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); startAutoPlay(); }));
    startAutoPlay();
  }

  // Init Peru Map
  if (document.getElementById('peru-map-container') && typeof am5 !== 'undefined') {
    initPeruMap();
  }

  // ── Lightbox ──
  const lbOverlay = document.getElementById('lightbox-overlay');
  const lbImg     = document.getElementById('lightbox-img');
  const lbName    = document.getElementById('lightbox-name');
  const lbClose   = document.getElementById('lightbox-close');

  function openLightbox(src, name) {
    lbImg.src = src;
    lbImg.alt = name;
    lbName.textContent = name;
    lbOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lbOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', e => {
    const trigger = e.target.closest('.lb-trigger');
    if (trigger) openLightbox(trigger.dataset.img, trigger.dataset.name);
  });

  lbClose.addEventListener('click', closeLightbox);
  lbOverlay.addEventListener('click', e => { if (e.target === lbOverlay) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
});

// ─── Distributor data per province ──────────────────────────────────────────
const PROVINCE_DISTRIBUTORS = {
  'PE-LIM': [
    { name: 'DISTRIB & NEGOCIACIONES DEXARI', contact: 'Javier Serra', phone: '+51 958 561 546' }
  ],
  'PE-PIU': [
    { name: 'MECCANO', contact: 'Ernesto Prieto / Iván Prieto / Ana Prieto', phone: '+51 923 414 701 / +51 989 565 004' }
  ],
  'PE-LAM': [
    { name: 'MECCANO', contact: 'Ernesto Prieto / Iván Prieto / Ana Prieto', phone: '+51 923 414 701 / +51 989 565 004' }
  ],
  'PE-LAL': [
    { name: 'CORPORACIÓN JIREH OIL S.A.C.', contact: 'Mónica Atoche', phone: '+51 959 601 848' }
  ],
  'PE-ARE': [
    { name: 'LUBRISUR DISTRIBUCIONES SCRL', contact: 'Evelyn', phone: '+51 959 376 442' },
    { name: 'M&C', contact: 'Carlos / Juan Carlos', phone: '+51 959 002 767 / +51 977 343 322' }
  ],
  'PE-CUS': [
    { name: 'INVERSIONES 2BH SRL', contact: 'Boris Olivera / Benjamín Leiva', phone: '+51 941 414 181 / +51 923 393 741' }
  ],
  'PE-APU': [
    { name: 'INVERSIONES 2BH SRL', contact: 'Boris Olivera / Benjamín Leiva', phone: '+51 941 414 181 / +51 923 393 741' }
  ],
  'PE-MDD': [
    { name: 'INVERSIONES 2BH SRL', contact: 'Boris Olivera / Benjamín Leiva', phone: '+51 941 414 181 / +51 923 393 741' }
  ],
  'PE-PUN': [{ name: 'LUBRISUR DISTRIBUCIONES SCRL', contact: 'Evelyn', phone: '+51 959 376 442' }],
  'PE-LOR': [{ name: 'Distribuidor MAXIMUM Loreto',    phone: 'Por confirmar' }],
  'PE-MOQ': [{ name: 'LUBRISUR DISTRIBUCIONES SCRL', contact: 'Evelyn', phone: '+51 959 376 442' }],
  'PE-TAC': [{ name: 'LUBRISUR DISTRIBUCIONES SCRL', contact: 'Evelyn', phone: '+51 959 376 442' }],
  'PE-CAJ': [{ name: 'Distribuidor MAXIMUM Cajamarca', phone: 'Por confirmar' }],
  'PE-TUM': [{ name: 'Distribuidor MAXIMUM Tumbes',    phone: 'Por confirmar' }],
};

const COUNTRY_DISTRIBUTORS = {
  'BO': [
    { name: 'LIMACHI CHAMBI LOURDES (8M)', contact: 'Darwin Ticona', address: 'La Paz, Bolivia', phone: '+591 75 319 212' }
  ],
};

function openProvinceModal(id, deptName) {
  const modal = document.getElementById('province-modal');
  const title = document.getElementById('province-modal-title');
  const list  = document.getElementById('province-modal-list');
  if (!modal || !title || !list) return;

  const distributors = PROVINCE_DISTRIBUTORS[id] || COUNTRY_DISTRIBUTORS[id] || [];
  title.textContent = `Distribuidores en ${deptName}`;
  list.innerHTML = distributors.map(d => `
    <li>
      <i class="fa-solid fa-store"></i>
      <div>
        <p class="dist-name">${d.name}</p>
        ${d.contact ? `<p class="dist-meta"><i class="fa-solid fa-user" style="font-size:.75em;opacity:.65;margin-right:5px;"></i>${d.contact}</p>` : ''}
        ${d.address ? `<p class="dist-meta"><i class="fa-solid fa-location-dot" style="font-size:.75em;opacity:.65;margin-right:5px;"></i>${d.address}</p>` : ''}
        <p class="dist-meta"><i class="fa-solid fa-phone" style="font-size:.75em;opacity:.65;margin-right:5px;"></i>${d.phone}</p>
      </div>
    </li>`).join('');

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeProvinceModal() {
  const modal = document.getElementById('province-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// ─── Mapa Perú ──────────────────────────────────────────────────────────────
function initPeruMap() {
  const RED      = am5.color(0xC20E1A);
  const RED_DARK = am5.color(0x9B0A13);
  const GRAY     = am5.color(0xD8DDE6);
  const GRAY_HOV = am5.color(0xBBC3CE);

  const activeDepts = new Set([
    'PE-PIU', 'PE-LAM', 'PE-LAL', 'PE-ARE', 'PE-CUS', 'PE-PUN',
    'PE-APU', 'PE-MDD', 'PE-LOR', 'PE-MOQ', 'PE-TAC', 'PE-LIM',
    'PE-CAJ', 'PE-TUM',
  ]);

  const root = am5.Root.new('peru-map-container');
  root._logo.dispose();

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: 'none', panY: 'none', wheelX: 'none', wheelY: 'none',
      projection: am5map.geoMercator(),
      background: am5.Rectangle.new(root, { fill: am5.color(0xffffff), fillOpacity: 0 })
    })
  );

  const polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_peruLow })
  );

  polygonSeries.mapPolygons.template.setAll({
    strokeWidth: 1.2,
    stroke: am5.color(0xffffff),
    interactive: true,
    tooltipText: '{name} — clic para ver distribuidores',
    cursorOverStyle: 'default'
  });

  polygonSeries.mapPolygons.template.adapters.add('fill', (_fill, target) => {
    const id = target.dataItem && target.dataItem.get('id');
    return activeDepts.has(id) ? RED : GRAY;
  });

  polygonSeries.mapPolygons.template.adapters.add('cursorOverStyle', (_style, target) => {
    const id = target.dataItem && target.dataItem.get('id');
    return activeDepts.has(id) ? 'pointer' : 'default';
  });

  polygonSeries.mapPolygons.template.events.on('pointerover', ev => {
    const id = ev.target.dataItem && ev.target.dataItem.get('id');
    ev.target.set('fill', activeDepts.has(id) ? RED_DARK : GRAY_HOV);
  });
  polygonSeries.mapPolygons.template.events.on('pointerout', ev => {
    const id = ev.target.dataItem && ev.target.dataItem.get('id');
    ev.target.set('fill', activeDepts.has(id) ? RED : GRAY);
  });

  polygonSeries.mapPolygons.template.events.on('click', ev => {
    const id   = ev.target.dataItem && ev.target.dataItem.get('id');
    const name = ev.target.dataItem && ev.target.dataItem.get('name');
    if (activeDepts.has(id)) openProvinceModal(id, name);
  });

  // Capa de pulso sobre zonas activas
  const pulseSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_peruLow })
  );
  pulseSeries.mapPolygons.template.setAll({
    fillOpacity: 0, stroke: RED, strokeWidth: 1.5, strokeOpacity: 0.85, interactive: false
  });
  pulseSeries.mapPolygons.template.adapters.add('strokeOpacity', (_op, target) => {
    const id = target.dataItem && target.dataItem.get('id');
    return activeDepts.has(id) ? 0.85 : 0;
  });
  pulseSeries.mapPolygons.template.events.on('datavalidated', ev => {
    const target = ev.target;
    const id = target.dataItem && target.dataItem.get('id');
    if (activeDepts.has(id)) {
      target.animate({ key: 'strokeWidth', to: 3, from: 1.2, duration: 1400, loops: Infinity, easing: am5.ease.inOut(am5.ease.sin) });
    }
  });

  chart.appear(800, 100);
}

// ─── Mapa Mundial ───────────────────────────────────────────────────────────
let worldMapInitialized = false;

function initWorldMap() {
  if (worldMapInitialized) return;
  worldMapInitialized = true;

  const RED  = am5.color(0xC20E1A);
  const GOLD = am5.color(0xEFA522);
  const GRAY = am5.color(0xD8DDE6);

  // PE = Perú (rojo), BO/EC/CO = presencia internacional (dorado)
  const activeCountries  = new Set(['BO', 'EC', 'CO', 'ES', 'FR', 'PT', 'CN', 'US']);
  const peruId = 'PE';

  const root = am5.Root.new('world-map-container');
  root._logo.dispose();

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: 'rotateX', panY: 'none', wheelX: 'none', wheelY: 'none',
      projection: am5map.geoMercator(),
      homeZoomLevel: 2.8,
      homeGeoPoint: { longitude: -73, latitude: -12 },
    })
  );

  const polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ['AQ']
    })
  );

  polygonSeries.mapPolygons.template.setAll({
    strokeWidth: 0.7,
    stroke: am5.color(0xffffff),
    interactive: true,
    tooltipText: '{name}'
  });

  polygonSeries.mapPolygons.template.adapters.add('fill', (_fill, target) => {
    const id = target.dataItem && target.dataItem.get('id');
    if (id === peruId) return RED;
    if (activeCountries.has(id)) return GOLD;
    return GRAY;
  });

  polygonSeries.mapPolygons.template.adapters.add('tooltipText', (_text, target) => {
    const id = target.dataItem && target.dataItem.get('id');
    if (id === peruId || (activeCountries.has(id) && COUNTRY_DISTRIBUTORS[id])) {
      return '{name} — clic para ver distribuidores';
    }
    return '{name}';
  });

  polygonSeries.mapPolygons.template.adapters.add('cursorOverStyle', (_style, target) => {
    const id = target.dataItem && target.dataItem.get('id');
    return (id === peruId || (activeCountries.has(id) && COUNTRY_DISTRIBUTORS[id])) ? 'pointer' : 'default';
  });

  polygonSeries.mapPolygons.template.events.on('pointerover', ev => {
    const id = ev.target.dataItem && ev.target.dataItem.get('id');
    if (id === peruId || activeCountries.has(id)) {
      ev.target.set('fillOpacity', 0.75);
    }
  });
  polygonSeries.mapPolygons.template.events.on('pointerout', ev => {
    ev.target.set('fillOpacity', 1);
  });

  polygonSeries.mapPolygons.template.events.on('click', ev => {
    const id   = ev.target.dataItem && ev.target.dataItem.get('id');
    const name = ev.target.dataItem && ev.target.dataItem.get('name');
    if (COUNTRY_DISTRIBUTORS[id]) openProvinceModal(id, name);
  });

  chart.appear(800, 100);
}

// ─── Scroll Reveal ──────────────────────────────────────────────────────────
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

// ─── Contact Form → WhatsApp ─────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const inputs  = contactForm.querySelectorAll('input, select, textarea');
    const nombre  = inputs[0].value.trim();
    const negocio = inputs[1].value.trim();
    const telefono = inputs[2].value.trim();
    const email   = inputs[3].value.trim();
    const alianza = inputs[4].options[inputs[4].selectedIndex].text;
    const contexto = inputs[5].value.trim();

    const msg = [
      '¡Hola MAXIMUM! Me interesa unirme a su red.',
      `*Nombre:* ${nombre}`,
      `*Negocio:* ${negocio}`,
      telefono ? `*Teléfono:* ${telefono}` : null,
      `*Email:* ${email}`,
      `*Tipo de alianza:* ${alianza}`,
      contexto ? `*Comentario:* ${contexto}` : null,
    ].filter(Boolean).join('\n');

    window.open('https://wa.me/51983152034?text=' + encodeURIComponent(msg), '_blank');
  });
}
