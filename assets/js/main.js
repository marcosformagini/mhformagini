/* ============================================================
   M. H. Formagini — main.js  (Dark Glass Fantasy)
   Sem dependências externas.
   ============================================================ */
'use strict';

/* ─────────────────────────────────────────
   LOADING SCREEN — Quill & Scroll Loop
───────────────────────────────────────── */
(function () {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;

    const icons = screen.querySelectorAll('.loading-icon');
    if (!icons.length) return;

    let current = 0;
    let looping = true;

    // Calcular dash lengths reais para cada path/line
    icons.forEach(svg => {
        svg.querySelectorAll('path, line').forEach(el => {
            const len = el.getTotalLength ? el.getTotalLength() : 200;
            el.style.setProperty('--dash-length', len);
        });
    });

    function showIcon(index) {
        if (!looping) return;
        const icon = icons[index];

        // Reset strokes for re-draw
        icon.querySelectorAll('path, line').forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // force reflow
            el.style.animation = '';
        });

        // Appear
        icon.classList.remove('fading');
        icon.classList.add('visible');

        // Trigger draw after a frame (allows reflow)
        requestAnimationFrame(() => {
            icon.classList.add('drawing');
        });

        // Hold, then fade
        const drawTime = 1400;
        const holdTime = 600;
        const fadeTime = 500;

        setTimeout(() => {
            if (!looping) return;
            icon.classList.add('fading');
            icon.classList.remove('visible');

            setTimeout(() => {
                icon.classList.remove('drawing', 'fading');
                // Next icon
                current = (current + 1) % icons.length;
                if (looping) showIcon(current);
            }, fadeTime);
        }, drawTime + holdTime);
    }

    // Start the loop
    showIcon(0);

    // Fade out after page load
    window.addEventListener('load', () => {
        // Espera o ciclo atual terminar suavemente
        setTimeout(() => {
            looping = false;
            screen.classList.add('fade-out');
            setTimeout(() => screen.remove(), 950);
        }, 600);
    });
})();

/* ─────────────────────────────────────────
   FLOATING NAV
───────────────────────────────────────── */
(function () {
    const navbar     = document.getElementById('mainNavbar');
    const toggle     = document.getElementById('navToggle');
    if (!navbar) return;

    // Mostra nav flutuante após scrollar 80% do hero
    const hero = document.getElementById('home');
    const showThreshold = hero ? hero.offsetHeight * 0.8 : 400;

    function onScroll() {
        const past = window.scrollY > showThreshold;
        navbar.classList.toggle('visible', past);
        if (toggle) toggle.classList.toggle('visible', past);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    if (toggle) {
        toggle.addEventListener('click', () => {
            const isOpen = navbar.classList.toggle('menu-open');
            toggle.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
        document.addEventListener('click', e => {
            if (!navbar.contains(e.target) && !toggle.contains(e.target)) {
                navbar.classList.remove('menu-open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth scroll
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
            navbar.classList.remove('menu-open');
            if (toggle) toggle.classList.remove('open');
        });
    });

    // ScrollSpy
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const spy = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
})();

/* (brand está dentro do nav flutuante — sem animação JS necessária) */

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));

    // Hero elements revelados via classe própria no DOM load
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            document.querySelectorAll('.hero-eyebrow, .hero-title, .hero-sub, .hero-divider, .hero-desc, .hero-actions, .hero-circle-wrap').forEach((el, i) => {
                setTimeout(() => el.classList.add('active'), i * 120);
            });
        }, 200);
    });
})();

/* ─────────────────────────────────────────
   HERO — EMBER PARTICLES
───────────────────────────────────────── */
(function () {
    const cv = document.getElementById('hero-ember-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let embers = [];

    function resize() {
        const hero = document.getElementById('home');
        if (!hero) return;
        cv.width  = hero.offsetWidth;
        cv.height = hero.offsetHeight;
    }

    class Ember {
        constructor(scattered) { this.init(scattered); }
        init(scattered) {
            this.x       = Math.random() * cv.width;
            this.y       = scattered ? Math.random() * cv.height : cv.height + 10;
            this.vx      = (Math.random() - 0.5) * 0.3;
            this.vy      = -(Math.random() * 0.65 + 0.2);
            this.size    = Math.random() * 2 + 0.3;
            this.base    = Math.random() * 0.5 + 0.08;
            this.life    = scattered ? Math.random() : 1;
            this.decay   = Math.random() * 0.0022 + 0.0007;
            this.wobble  = Math.random() * Math.PI * 2;
            this.wSpeed  = Math.random() * 0.022 + 0.007;
            this.isGold  = Math.random() > 0.38;
        }
        update() {
            this.wobble += this.wSpeed;
            this.x += this.vx + Math.sin(this.wobble) * 0.25;
            this.y += this.vy;
            this.life -= this.decay;
            if (this.life <= 0 || this.y < -10) this.init(false);
        }
        draw() {
            const a = this.life * this.base;
            if (a < 0.01) return;
            const [r, g, b] = this.isGold ? [210, 155, 58] : [192, 192, 200];
            const gr = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
            gr.addColorStop(0, `rgba(${r},${g},${b},${a})`);
            gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = gr;
            ctx.fill();
        }
    }

    function init() {
        resize();
        const n = Math.min(80, Math.floor((cv.width * cv.height) / 13000));
        embers = Array.from({ length: n }, () => new Ember(true));
    }
    function loop() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        embers.forEach(e => { e.update(); e.draw(); });
        requestAnimationFrame(loop);
    }
    window.addEventListener('resize', init, { passive: true });
    init(); loop();
})();

/* ─────────────────────────────────────────
   HERO — FOG PARALLAX
───────────────────────────────────────── */
(function () {
    const hero    = document.getElementById('home');
    if (!hero) return;
    const fog1    = hero.querySelector('.hero-fog-1');
    const fog2    = hero.querySelector('.hero-fog-2');
    const content = hero.querySelector('.hero-inner');
    if (!fog1 || !fog2) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width  - 0.5;
        ty = (e.clientY - r.top)  / r.height - 0.5;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; }, { passive: true });

    (function tick() {
        cx += (tx - cx) * 0.05;
        cy += (ty - cy) * 0.05;
        fog1.style.transform    = `translate(${cx * -16}px,${cy * -10}px) scale(1.04)`;
        fog2.style.transform    = `translate(${cx *  10}px,${cy *  7}px) scale(1.03)`;
        if (content) content.style.transform = `translate(${cx * 5}px,${cy * 3}px)`;
        requestAnimationFrame(tick);
    })();
})();

/* ─────────────────────────────────────────
   HERO — SAGA IGNITION (chars dourados)
───────────────────────────────────────── */
(function () {
    const el = document.getElementById('hero-saga');
    if (!el) return;
    const text = el.textContent;
    el.innerHTML = '';
    const chars = [];
    for (let i = 0; i < text.length; i++) {
        const s = document.createElement('span');
        s.textContent = text[i];
        s.className = 'char';
        el.appendChild(s);
        if (text[i].trim()) chars.push(s);
    }
    // Aguarda reveal do hero-sub
    setTimeout(() => {
        const timer = setInterval(() => {
            const unlit = chars.filter(c => !c.classList.contains('lit'));
            if (!unlit.length) { clearInterval(timer); return; }
            const pick = unlit[Math.floor(Math.random() * unlit.length)];
            pick.classList.add('lit');
        }, 100);
    }, 1800);
})();

/* ─────────────────────────────────────────
   PARTÍCULAS — Seção Autor
───────────────────────────────────────── */
(function () {
    const cv = document.getElementById('particles-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let pts = [];

    function resize() {
        cv.width  = cv.parentElement.offsetWidth;
        cv.height = cv.parentElement.offsetHeight;
    }

    function init() {
        resize();
        const n = Math.min(55, Math.floor((cv.width * cv.height) / 18000));
        pts = Array.from({ length: n }, () => ({
            x:  Math.random() * cv.width,
            y:  Math.random() * cv.height,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            r:  Math.random() * 1.6 + 0.3,
            op: Math.random() * 0.3 + 0.05,
            fd: Math.random() > 0.5 ? 1 : -1,
            fs: Math.random() * 0.004 + 0.001,
            mx: Math.random() * 0.35 + 0.08,
            gold: Math.random() > 0.45,
        }));
    }
    function loop() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        pts.forEach(p => {
            p.x  += p.vx; p.y += p.vy;
            p.op += p.fd * p.fs;
            if (p.op >= p.mx) p.fd = -1;
            if (p.op <= 0.02) p.fd =  1;
            if (p.x < 0 || p.x > cv.width)  p.vx *= -1;
            if (p.y < 0 || p.y > cv.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.gold
                ? `rgba(201,168,76,${p.op})`
                : `rgba(192,192,200,${p.op * 0.6})`;
            ctx.fill();
        });
        requestAnimationFrame(loop);
    }
    window.addEventListener('resize', init, { passive: true });
    init(); loop();
})();

/* ─────────────────────────────────────────
   PARTÍCULAS — Seção FAQ
───────────────────────────────────────── */
(function () {
    const cv = document.getElementById('faq-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let pts = [];

    function init() {
        cv.width  = cv.parentElement.offsetWidth;
        cv.height = cv.parentElement.offsetHeight;
        const n = Math.floor((cv.width * cv.height) / 5500);
        pts = Array.from({ length: n }, () => ({
            x:  Math.random() * cv.width,
            y:  Math.random() * cv.height,
            r:  Math.random() * 1.4 + 0.2,
            op: Math.random() * 0.25,
            fd: Math.random() > 0.5 ? 1 : -1,
            fs: Math.random() * 0.005 + 0.001,
            mx: Math.random() * 0.22 + 0.04,
            gold: Math.random() > 0.5,
        }));
    }
    function loop() {
        ctx.clearRect(0, 0, cv.width, cv.height);
        pts.forEach(p => {
            p.op += p.fd * p.fs;
            if (p.op >= p.mx) p.fd = -1;
            if (p.op <= 0)    p.fd =  1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.gold
                ? `rgba(201,168,76,${p.op})`
                : `rgba(192,192,200,${p.op * 0.5})`;
            ctx.fill();
        });
        requestAnimationFrame(loop);
    }
    window.addEventListener('resize', init, { passive: true });
    init(); loop();
})();

/* (mapas removidos — sem JS de zoom necessário) */

/* ─────────────────────────────────────────
   FAQ — accordion custom
───────────────────────────────────────── */
(function () {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        const btn    = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Fecha todos
            items.forEach(i => {
                i.classList.remove('open');
                const a = i.querySelector('.faq-answer');
                if (a) a.style.maxHeight = '0';
                const b = i.querySelector('.faq-question');
                if (b) b.setAttribute('aria-expanded', 'false');
            });

            // Abre o clicado (se estava fechado)
            if (!isOpen) {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
})();

/* ─────────────────────────────────────────
   BACKGROUND ALTERNADO (2.jpg ↔ 1.png)
   hero, universo, faq → imagem 2 (padrão)
   lancamento, autor, wiki → imagem 1 (alt)
───────────────────────────────────────── */
(function () {
    const bg = document.querySelector('.site-bg');
    if (!bg) return;

    const altSections = document.querySelectorAll('#lancamento, #autor, #wiki');
    if (!altSections.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                bg.classList.add('bg-alt');
            }
        });
    }, { threshold: 0.3 });

    const defSections = document.querySelectorAll('#home, #faq');
    const obsDefault = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                bg.classList.remove('bg-alt');
            }
        });
    }, { threshold: 0.3 });

    altSections.forEach(s => obs.observe(s));
    defSections.forEach(s => obsDefault.observe(s));
})();

/* ─────────────────────────────────────────
   HERO SLIDESHOW — vídeo + imagens em loop
   Fluxo: vídeo → img 1 → img 2 → vídeo…
   Crossfade suave entre cada etapa.
───────────────────────────────────────── */
(function () {
    const video = document.getElementById('heroVideo');
    const slide1 = document.getElementById('heroSlide1');
    const slide2 = document.getElementById('heroSlide2');
    if (!video || !slide1 || !slide2) return;

    const IMAGE_DURATION = 5000; // ms que cada imagem fica visível
    const FADE_MS = 1400;        // deve bater com o transition do CSS

    video.muted = true;
    video.loop = false;

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function slideSequence() {
        // Fade out vídeo, fade in imagem 1
        video.style.opacity = '0';
        slide1.classList.add('active');
        await wait(FADE_MS + IMAGE_DURATION);

        // Fade out imagem 1, fade in imagem 2
        slide1.classList.remove('active');
        slide2.classList.add('active');
        await wait(FADE_MS + IMAGE_DURATION);

        // Fade out imagem 2, fade in vídeo
        slide2.classList.remove('active');
        video.currentTime = 0;
        video.style.opacity = '1';
        video.play().catch(() => {});
    }

    // Quando o vídeo termina, inicia sequência de imagens
    video.addEventListener('ended', function () {
        slideSequence();
    });

    // Inicia playback
    video.play().catch(() => {
        document.addEventListener('click', () => video.play(), { once: true });
    });
})();
