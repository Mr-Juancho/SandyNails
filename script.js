/* ======================================================
   Carrusel de portada (hero)
====================================================== */
const slideContainer = document.querySelector('.carousel-slide');
const slides         = document.querySelectorAll('.carousel-slide img');
const dots           = document.querySelectorAll('.carousel-dots .dot');

let idx        = 0;
let slideWidth = 0;

function showSlide(i){
  idx = i;
  slideContainer.style.transform = `translateX(-${idx * slideWidth}px)`;
  dots.forEach(d => d.classList.remove('active'));
  dots[idx].classList.add('active');
}

/* ======================================================
   NAVBAR – toggle (abre / cierra menú móvil)
====================================================== */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks){
  navToggle.addEventListener('click', () => {
    /* anima las 3 rayitas → X */
    navToggle.classList.toggle('open');
    /* muestra / oculta la lista */
    navLinks.classList.toggle('open');
  });

  /* Cierra el menú al hacer click en un enlace */
  navLinks.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );
}


window.addEventListener('load', () => {
  slideWidth = document.querySelector('.carousel-container').clientWidth;

  window.addEventListener('resize', () => {
    slideWidth = document.querySelector('.carousel-container').clientWidth;
    showSlide(idx);
    applyRowLimit();                              // recalc. filas galería
  });

  dots.forEach(dot =>
    dot.addEventListener('click', () =>
      showSlide(Number(dot.dataset.index)))
  );

  setInterval(() =>
    showSlide((idx + 1) % slides.length), 5000);
});

/* ======================================================
   Intro‑Collection – fade‑in
====================================================== */
const introSection = document.querySelector('.intro-collection');
if (introSection){
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){
        introSection.classList.add('visible');
        io.disconnect();
      }
    });
  }, { threshold:0.3 });
  io.observe(introSection);
}

/* ======================================================
   Filtrado de galería (tarjetas + pestañas)
====================================================== */
const categoryCards = document.querySelectorAll('.category-card');
const tabItems      = document.querySelectorAll('.gallery-tabs .tab-item');
const galleryGrid   = document.querySelector('.gallery-grid');
const galleryCards  = document.querySelectorAll('.gallery-grid .card');
const toggleBtn     = document.getElementById('toggleGallery');

let currentFilter = 'todo';
let expanded      = false;

/* ======================================================
   Filtrado de galería (tarjetas + pestañas)
====================================================== */
function filterGallery(filter){
    filter = filter.toLowerCase();              // normaliza
  
    galleryCards.forEach(card => {
      const cat   = card.dataset.category?.toLowerCase() || '';
      const match = (filter === 'todo') || (cat === filter);
  
      card.classList.toggle('hide', !match);    // muestra / oculta
    });
  
    /* Reinicia la cuadrícula (máx. 2 filas) */
    expanded = false;
    applyRowLimit();
  
    /* Re-enlaza el lightbox solo a las tarjetas visibles */
    bindLightboxTriggers();
  }
  

/* click en tarjetas‑categoría */
categoryCards.forEach(card => {
  card.addEventListener('click', () => {
    currentFilter = card.dataset.filter;
    categoryCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    tabItems.forEach(t => t.classList.remove('active'));
    document
      .querySelector(`.gallery-tabs [data-filter='${currentFilter}']`)
      ?.classList.add('active');
    filterGallery(currentFilter);
    document.getElementById('galeria')
            .scrollIntoView({ behavior:'smooth' });
  });
});

/* click en pestañas sobre la galería */
tabItems.forEach(tab => {
  tab.addEventListener('click', () => {
    currentFilter = tab.dataset.filter;
    tabItems.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    categoryCards.forEach(c => c.classList.remove('active'));
    document
      .querySelector(`.category-card[data-filter='${currentFilter}']`)
      ?.classList.add('active');
    filterGallery(currentFilter);
  });
});

/* ======================================================
   Galería: limitar a 2 filas + Ver más / Ver menos
====================================================== */
function getColumns(){
  const card = galleryGrid.querySelector('.card:not(.hide)');
  if (!card) return 1;
  const cardWidth = card.getBoundingClientRect().width;
  return Math.max(1, Math.floor(galleryGrid.clientWidth / (cardWidth + 20)));
}

function applyRowLimit(){
  const cols       = getColumns();
  const maxVisible = cols * 2;
  let visibleCnt   = 0;

  galleryCards.forEach(card => {
    if (card.classList.contains('hide')) return;
    visibleCnt++;
    card.style.display =
      (!expanded && visibleCnt > maxVisible) ? 'none' : '';
  });

  if (visibleCnt > maxVisible){
    toggleBtn.style.display = 'inline-block';
    toggleBtn.textContent   = expanded ? 'Ver menos' : 'Ver más';
  } else {
    toggleBtn.style.display = 'none';
  }
}

toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    applyRowLimit();
  
    // Solo al colapsar (cuando expanded pasa a false)
    if (!expanded) {
      document.getElementById('galeria')
              .scrollIntoView({ behavior: 'smooth' });
    }
  });
  

window.addEventListener('load', applyRowLimit);

/* ======================================================
   LIGHT‑BOX  (galería + certificaciones)
   — un solo punto de entrada —
====================================================== */

/* ▸  Estructura que ya está en tu HTML:
<div id="lightbox" class="lightbox hidden">
  <span class="close">&times;</span>
  <img src="" alt="Vista ampliada">
</div>
*/

const lightbox     = document.getElementById('lightbox');
const lightboxImg  = lightbox.querySelector('img');
const closeBtn     = lightbox.querySelector('.close');

/* ——————————— 1. Asociar disparadores ———————————
   · Cualquier elemento con  data‑lightbox
   · Todas las tarjetas visibles de .gallery-grid
*/
function bindLightboxTriggers () {
  /* a) miniaturas de la galería */
  document.querySelectorAll('.gallery-grid .card:not(.hide)')
          .forEach(card => {
    card.addEventListener('click', () => {
      const src = card.querySelector('img').src;
      openLightbox(src);
    }, { once:false });
  });

  /* b) certificaciones (o cualquier otro) */
  document.querySelectorAll('[data-lightbox]')
          .forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();                                // evita salto
      const src = link.getAttribute('href') ||
                  link.querySelector('img')?.src;
      if (src) openLightbox(src);
    }, { once:false });
  });
}

/* ——————————— 2. Abrir / cerrar ——————————— */
function openLightbox (src){
  lightboxImg.src = src;
  lightbox.classList.remove('hidden');
}

function closeLightbox (){
  lightbox.classList.add('hidden');
}

/* ——————————— 3. Eventos globales ——————————— */
closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

/* ——————————— 4. Inicializar ——————————— */
window.addEventListener('load', bindLightboxTriggers);

/*  Si tu script añade o quita tarjetas dinámicamente
    (p. ej. al filtrar la galería), vuelve a llamar:
        bindLightboxTriggers();
    después de cada cambio para que los nuevos nodos
    también queden enlazados.
*/



/* ======================================================
   Botón «Ver Galería» del hero
====================================================== */
document.querySelector('.scroll-btn')
        .addEventListener('click', () =>
  document.getElementById('galeria')
          .scrollIntoView({ behavior:'smooth' })
);

/* ======================================================
   Carrusel de categorías – avanza 1 tarjeta por vez
====================================================== */
const catCarousel = document.querySelector('.categories-carousel');
if (catCarousel){
    const catTrack = catCarousel.querySelector('.categories-track');
    const catCards = [...catTrack.children];
    const prevBtn  = catCarousel.querySelector('.cat-prev');
    const nextBtn  = catCarousel.querySelector('.cat-next');

  /* ——— utilidades ——— */
  const GAP = () => parseFloat(getComputedStyle(catTrack).gap) || 0;

  const perPage = () => {
    const w = window.innerWidth;
    if (w >= 1200) return 4;     // ← NUEVA regla: ≥1200 px → 4
    if (w >= 992)  return 3;
    if (w >= 600)  return 2;
    return 1;
  };
  

  /* ancho de UNA tarjeta + gap (vuelve a calcularse en cada resize) */
  const step = () => {
    const cardW = catCards[0].getBoundingClientRect().width;
    return cardW + GAP();
  };

  let index = 0;
  let auto;

  const show = i => {
    index = i;
    catTrack.style.transform = `translateX(-${step()*index}px)`;
  };

  const maxStart = () =>
    Math.max(0, catCards.length - perPage());


  function move(delta){
    clearInterval(auto);                   // pausa auto‑slide
    const m = maxStart();
    let next = index + delta;
    if (next < 0) next = m;
    if (next > m) next = 0;
    show(next);
  }

  prevBtn.addEventListener('click', () => move(-1));
  nextBtn.addEventListener('click', () => move(+1));

  /* ——— reajuste al redimensionar ——— */
  function startAuto(){
    auto = setInterval(() => {
      const m = maxStart();
      show(index < m ? index + 1 : 0);
    }, 2000);
  }

  /* ——— inicialización ——— */
  window.addEventListener('load', () => {
    show(0);
    startAuto();

    ['pointerdown','touchstart','wheel','mouseenter']
      .forEach(ev =>
        catCarousel.addEventListener(ev, () => clearInterval(auto)));

    window.addEventListener('resize', () => {
      const m = maxStart();
      if (index > m) index = 0;
      show(index);
    });
  });
}

/* ======================================================
   CERTIFICADOS – limitar visibles + Ver más / Ver menos
====================================================== */
const certGrid   = document.querySelector('.cert-grid');
const certCards  = [...certGrid.querySelectorAll('.cert-card')];
const certBtn    = document.getElementById('toggleCerts');

let certExpanded = false;
const MIN_VISIBLE = 5;          // cuántos quieres mostrar de inicio

function applyCertLimit () {
  /* ❶  Cantidad que debe quedar visible */
  const maxVisible = certExpanded ? certCards.length : MIN_VISIBLE;

  /* ❷  Mostrar / ocultar según el índice */
  certCards.forEach((c, i) => {
    c.style.display = (i < maxVisible) ? '' : 'none';
  });

  /* ❸  Botón */
  if (certCards.length > MIN_VISIBLE){
    certBtn.style.display = 'inline-block';
    certBtn.textContent   = certExpanded ? 'Ver menos' : 'Ver más';
  } else {
    certBtn.style.display = 'none';
  }
}

/*  resto del bloque queda igual… */
certBtn?.addEventListener('click', () => {
  certExpanded = !certExpanded;
  applyCertLimit();
  if (certExpanded) certBtn.scrollIntoView({behavior:'smooth'});
});
window.addEventListener('load',   applyCertLimit);
window.addEventListener('resize', applyCertLimit);

/* ======================================================
   Botón «Copiar» del teléfono
====================================================== */
const phoneLink = document.querySelector('.phone-link');   // <a href="tel:…">
const copyBtn   = document.getElementById('copyPhone');

if (phoneLink && copyBtn && navigator.clipboard) {         // API disponible
  copyBtn.addEventListener('click', async () => {
    try {
      /* 1. texto limpio del enlace  (+1 (864) 346‑8255)  */
      const phone = phoneLink.textContent.trim();
      await navigator.clipboard.writeText(phone);

      /* 2. feedback visual */
      copyBtn.textContent = '¡Copiado!';
      copyBtn.disabled    = true;                         // evita doble clic
      
      /* 3. restaurar tras 2 s */
      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
        copyBtn.disabled    = false;
      }, 2000);
      
    } catch (err) {
      console.error('No se pudo copiar:', err);
      copyBtn.textContent = 'Error';
      setTimeout(() => (copyBtn.textContent = 'Copiar'), 2000);
    }
  });
}
