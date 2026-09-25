(() => {
  "use strict";

  if (window.lucide) {
    lucide.createIcons({ attrs: { "stroke-width": 1.7 } });
  }

  const body = document.body;
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const menu = document.querySelector(".mobile-menu");
  const menuBtn = document.querySelector(".menu-btn");
  const closeBtn = document.querySelector(".menu-close");

  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    body.classList.toggle("menu-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
  };

  menuBtn?.addEventListener("click", () => setMenu(true));
  closeBtn?.addEventListener("click", () => setMenu(false));
  menu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") setMenu(false);
  });

  const onScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? (scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${p}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));


  // Feedback visual dos SVGs também no toque, sem aquele retângulo azul cafona do mobile.
  document.addEventListener("pointerdown", (e) => {
    const control = e.target.closest("a, button");
    if (!control) return;
    const icon = control.querySelector("svg");
    if (!icon) return;
    icon.classList.remove("icon-pop");
    void icon.offsetWidth;
    icon.classList.add("icon-pop");
    window.setTimeout(() => icon.classList.remove("icon-pop"), 460);
  }, { passive: true });

  // Arraste suave no desktop, scroll nativo no touch
  document.querySelectorAll(".drag-scroll").forEach(scroller => {
    let down = false, startX = 0, startLeft = 0, moved = false;
    scroller.addEventListener("pointerdown", e => {
      if (e.pointerType === "touch") return;
      down = true; moved = false; startX = e.clientX; startLeft = scroller.scrollLeft;
      scroller.classList.add("dragging");
      scroller.setPointerCapture?.(e.pointerId);
    });
    scroller.addEventListener("pointermove", e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      scroller.scrollLeft = startLeft - dx;
    });
    const stop = () => { down = false; scroller.classList.remove("dragging"); };
    scroller.addEventListener("pointerup", stop);
    scroller.addEventListener("pointercancel", stop);
    scroller.addEventListener("click", e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });

  // Carrossel + indicadores
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const cards = [...carousel.children];
    const wrap = carousel.closest(".carousel-wrap");
    const dots = wrap?.querySelector(".carousel-dots");
    const prev = wrap?.querySelector("[data-prev]");
    const next = wrap?.querySelector("[data-next]");

    if (!cards.length || !dots) return;

    cards.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Ir para item ${i + 1}`);
      b.addEventListener("click", () => cards[i].scrollIntoView({ behavior:"smooth", inline:"start", block:"nearest" }));
      dots.appendChild(b);
    });
    const dotEls = [...dots.children];

    const activeIndex = () => {
      let best = 0, bestD = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - carousel.scrollLeft);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    };
    const update = () => {
      const idx = activeIndex();
      dotEls.forEach((d, i) => d.classList.toggle("active", i === idx));
    };
    carousel.addEventListener("scroll", () => requestAnimationFrame(update), { passive:true });
    update();

    const move = dir => {
      const idx = activeIndex();
      const target = Math.max(0, Math.min(cards.length - 1, idx + dir));
      carousel.scrollTo({ left: cards[target].offsetLeft, behavior:"smooth" });
    };
    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));

    carousel.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    });
  });

  // 3D sutil em elementos que aceitam ponteiro preciso
  if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(el => {
      const card = el.querySelector(".hero-card") || el;
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 7}deg) translateZ(0)`;
      });
      el.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    document.querySelectorAll(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width/2)) * .08;
        const y = (e.clientY - (r.top + r.height/2)) * .08;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => btn.style.transform = "");
    });
  }
})();