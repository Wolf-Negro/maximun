document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const toggleMenu = () => {
    mobileOverlay.classList.toggle('active');
    if(mobileOverlay.classList.contains('active')) {
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  mobileMenuBtn.addEventListener('click', toggleMenu);
  closeMenuBtn.addEventListener('click', toggleMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', toggleMenu);
  });

  // Sticky Header on Scroll
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Product Rendering & Advanced Filtering Logic ---
  const featuredGrid = document.getElementById('featured-products-grid');
  const catalogGrid = document.getElementById('main-products-grid');
  const filtersContainer = document.getElementById('catalog-filters');
  const searchInput = document.getElementById('catalog-search');
  const sortSelect = document.getElementById('catalog-sort');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const catalogCounter = document.getElementById('catalog-counter');

  let allProducts = [];
  let filteredProducts = [];
  let currentLimit = 12;
  const ITEMS_PER_PAGE = 12;

  function buildCard(p) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', p.category.toLowerCase());
    
    let tagHtml = '';
    if (p.featured) {
      tagHtml = '<div class="product-tag premium">PREMIUM</div>';
    } else if (p.nombre.toLowerCase().includes('alta temp') || p.nombre.toLowerCase().includes('extreme')) {
      tagHtml = '<div class="product-tag highlight">HOT</div>';
    }

    card.innerHTML = `
      ${tagHtml}
      <div class="product-img">
        <img src="${p.image}" alt="${p.alt}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h4 class="product-name">${p.nombre}</h4>
        <p class="product-size">${p.descripcion ? p.descripcion.substring(0, 60) + (p.descripcion.length > 60 ? '...' : '') : 'Calidad MAXIMUM'}</p>
      </div>
    `;
    return card;
  }

  function renderFeatured() {
    if (!featuredGrid) return;
    featuredGrid.innerHTML = '';
    const featured = allProducts.filter(p => p.featured).slice(0, 12); // max 12
    featured.forEach(p => featuredGrid.appendChild(buildCard(p)));
  }

  function updateCatalogUI() {
    if (!catalogGrid) return;
    
    // Slice for progressive loading
    const sliced = filteredProducts.slice(0, currentLimit);
    
    catalogGrid.innerHTML = '';
    sliced.forEach(p => catalogGrid.appendChild(buildCard(p)));

    // Update Counter & Button
    const total = filteredProducts.length;
    let showing = sliced.length;
    catalogCounter.innerText = `Mostrando ${showing} de ${total} productos`;

    if (showing >= total) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'inline-flex';
    }
  }

  function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const filterValue = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const sortValue = sortSelect.value;

    filteredProducts = allProducts.filter(p => {
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm) || p.descripcion.toLowerCase().includes(searchTerm);
      const matchCategory = filterValue === 'all' || p.category.toLowerCase() === filterValue;
      return matchSearch && matchCategory;
    });

    // Sorting
    filteredProducts.sort((a, b) => {
      if (sortValue === 'az') return a.nombre.localeCompare(b.nombre);
      if (sortValue === 'za') return b.nombre.localeCompare(a.nombre);
      if (sortValue === 'category') return a.category.localeCompare(b.category);
      // Default: sort by logical priority (featured first, then category, then nombre)
      if (a.orderPriority !== b.orderPriority) return a.orderPriority - b.orderPriority;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.nombre.localeCompare(b.nombre);
    });

    currentLimit = ITEMS_PER_PAGE; // reset pagination when filters change
    updateCatalogUI();
  }

  function initCatalog() {
    if (window.MAXIMUM_PRODUCTS) {
      allProducts = window.MAXIMUM_PRODUCTS;

      // Ensure default sorting applies initially
      allProducts.sort((a, b) => {
        if (a.orderPriority !== b.orderPriority) return a.orderPriority - b.orderPriority;
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.nombre.localeCompare(b.nombre);
      });

      renderFeatured();

      // Extract unique categories directly from data
      const categories = [...new Set(allProducts.map(p => p.category))];
      categories.sort();
      
      // Inject filters if missing
      if (filtersContainer && filtersContainer.children.length === 1) { // Only "Todos" exists
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', cat.toLowerCase());
            btn.innerText = cat;
            filtersContainer.appendChild(btn);
        });
      }

      // Filter events
      const dynamicallyAddedFilters = document.querySelectorAll('.filter-btn');
      dynamicallyAddedFilters.forEach(btn => {
        btn.addEventListener('click', () => {
          dynamicallyAddedFilters.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applyFiltersAndSort();
        });
      });

      // Search & Sort events
      if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
      if (sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);
      
      // Load more
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          currentLimit += ITEMS_PER_PAGE;
          updateCatalogUI();
        });
      }

      applyFiltersAndSort();
    }
  }

  initCatalog();

  // Smooth Scrolling for anchor links (if browser doesn't support css smooth scroll fully)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if(this.getAttribute('href').length > 1) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if(targetElement) {
          const topOffset = targetElement.getBoundingClientRect().top + window.scrollY - 80; // 80px for nav offset
          window.scrollTo({
            top: topOffset,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Hero Carousel Logic
  const track = document.getElementById('carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlide = 0;
  let slideInterval;

  if (track && slides.length > 0) {
    const showSlide = (n) => {
      dots.forEach(dot => dot.classList.remove('active'));

      currentSlide = (n + slides.length) % slides.length;
      
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    };

    const nextSlideFunc = () => {
      showSlide(currentSlide + 1);
    };

    const prevSlideFunc = () => {
      showSlide(currentSlide - 1);
    };

    const startAutoPlay = () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlideFunc, 6500); // 6.5 seconds
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlideFunc();
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlideFunc();
        startAutoPlay();
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        startAutoPlay();
      });
    });

    // Start autoplay
    startAutoPlay();
  }
});
