/* ============================================================
   M. H. Formagini — main.js (v3)
   Sem dependências. Canvas pausa fora da viewport e com a
   aba oculta; tudo respeita prefers-reduced-motion.
   ============================================================ */
'use strict';

document.documentElement.classList.replace('no-js', 'js');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────
   NAV FLUTUANTE + SCROLLSPY
───────────────────────────────────────── */
(function () {
    const navbar = document.getElementById('mainNavbar');
    const toggle = document.getElementById('navToggle');
    if (!navbar) return;

    const hero = document.getElementById('home');

    function onScroll() {
        const threshold = hero ? hero.offsetHeight * 0.8 : 400;
        const past = window.scrollY > threshold;
        navbar.classList.toggle('visible', past);
        if (toggle) toggle.classList.toggle('visible', past);
        if (!past) closeMenu();
    }

    function closeMenu() {
        navbar.classList.remove('menu-open');
        if (toggle) {
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle) {
        toggle.addEventListener('click', () => {
            const isOpen = navbar.classList.toggle('menu-open');
            toggle.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
        document.addEventListener('click', e => {
            if (!navbar.contains(e.target) && !toggle.contains(e.target)) closeMenu();
        });
    }

    // Fecha o menu ao navegar (scroll suave fica por conta do CSS)
    navbar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ScrollSpy
    const sections = document.querySelectorAll('section[id]');
    const navLinks = navbar.querySelectorAll('.nav-link');
    const spy = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
                });
            }
        });
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach(s => spy.observe(s));
})();

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (REDUCED) {
        els.forEach(el => el.classList.add('active'));
        return;
    }
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
})();

/* ─────────────────────────────────────────
   HERO — IGNIÇÃO DO SUBTÍTULO (letra a letra)
───────────────────────────────────────── */
(function () {
    const el = document.getElementById('hero-saga');
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    const chars = [];
    for (const ch of text) {
        const s = document.createElement('span');
        s.textContent = ch;
        s.className = 'char';
        el.appendChild(s);
        if (ch.trim()) chars.push(s);
    }
    if (REDUCED) {
        chars.forEach(c => c.classList.add('lit'));
        return;
    }
    setTimeout(() => {
        const timer = setInterval(() => {
            const unlit = chars.filter(c => !c.classList.contains('lit'));
            if (!unlit.length) { clearInterval(timer); return; }
            unlit[Math.floor(Math.random() * unlit.length)].classList.add('lit');
        }, 100);
    }, 1800);
})();

/* ─────────────────────────────────────────
   CANVAS — motor compartilhado
   Pausa fora da viewport e com a aba oculta.
───────────────────────────────────────── */
function createCanvasScene(canvas, setup, step) {
    if (!canvas || REDUCED) return;
    const ctx = canvas.getContext('2d');
    let state = null;
    let running = false;
    let inView = false;
    let rafId = 0;

    function resize() {
        const host = canvas.parentElement;
        canvas.width = host.offsetWidth;
        canvas.height = host.offsetHeight;
        state = setup(canvas);
    }

    function loop() {
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        step(ctx, canvas, state);
        rafId = requestAnimationFrame(loop);
    }

    function sync() {
        const shouldRun = inView && !document.hidden;
        if (shouldRun && !running) { running = true; rafId = requestAnimationFrame(loop); }
        if (!shouldRun && running) { running = false; cancelAnimationFrame(rafId); }
    }

    new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        sync();
    }).observe(canvas);

    document.addEventListener('visibilitychange', sync);

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    resize();
}

/* Brasas do hero */
createCanvasScene(
    document.getElementById('hero-ember-canvas'),
    cv => {
        const n = Math.min(80, Math.floor((cv.width * cv.height) / 13000));
        const make = scattered => ({
            x: Math.random() * cv.width,
            y: scattered ? Math.random() * cv.height : cv.height + 10,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -(Math.random() * 0.65 + 0.2),
            size: Math.random() * 2 + 0.3,
            base: Math.random() * 0.5 + 0.08,
            life: scattered ? Math.random() : 1,
            decay: Math.random() * 0.0022 + 0.0007,
            wobble: Math.random() * Math.PI * 2,
            wSpeed: Math.random() * 0.022 + 0.007,
            gold: Math.random() > 0.38,
        });
        return { make, embers: Array.from({ length: n }, () => make(true)) };
    },
    (ctx, cv, st) => {
        st.embers.forEach((e, i) => {
            e.wobble += e.wSpeed;
            e.x += e.vx + Math.sin(e.wobble) * 0.25;
            e.y += e.vy;
            e.life -= e.decay;
            if (e.life <= 0 || e.y < -10) { st.embers[i] = st.make(false); return; }
            const a = e.life * e.base;
            if (a < 0.01) return;
            const [r, g, b] = e.gold ? [210, 155, 58] : [192, 192, 200];
            const gr = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2.5);
            gr.addColorStop(0, `rgba(${r},${g},${b},${a})`);
            gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = gr;
            ctx.fill();
        });
    }
);

/* Partículas — seção Autor */
createCanvasScene(
    document.getElementById('particles-canvas'),
    cv => {
        const n = Math.min(55, Math.floor((cv.width * cv.height) / 18000));
        return Array.from({ length: n }, () => ({
            x: Math.random() * cv.width,
            y: Math.random() * cv.height,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            r: Math.random() * 1.6 + 0.3,
            op: Math.random() * 0.3 + 0.05,
            fd: Math.random() > 0.5 ? 1 : -1,
            fs: Math.random() * 0.004 + 0.001,
            mx: Math.random() * 0.35 + 0.08,
            gold: Math.random() > 0.45,
        }));
    },
    (ctx, cv, pts) => {
        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.op += p.fd * p.fs;
            if (p.op >= p.mx) p.fd = -1;
            if (p.op <= 0.02) p.fd = 1;
            if (p.x < 0 || p.x > cv.width) p.vx *= -1;
            if (p.y < 0 || p.y > cv.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.gold
                ? `rgba(201,168,76,${p.op})`
                : `rgba(192,192,200,${p.op * 0.6})`;
            ctx.fill();
        });
    }
);

/* Partículas — seção FAQ */
createCanvasScene(
    document.getElementById('faq-canvas'),
    cv => {
        const n = Math.min(160, Math.floor((cv.width * cv.height) / 5500));
        return Array.from({ length: n }, () => ({
            x: Math.random() * cv.width,
            y: Math.random() * cv.height,
            r: Math.random() * 1.4 + 0.2,
            op: Math.random() * 0.25,
            fd: Math.random() > 0.5 ? 1 : -1,
            fs: Math.random() * 0.005 + 0.001,
            mx: Math.random() * 0.22 + 0.04,
            gold: Math.random() > 0.5,
        }));
    },
    (ctx, cv, pts) => {
        pts.forEach(p => {
            p.op += p.fd * p.fs;
            if (p.op >= p.mx) p.fd = -1;
            if (p.op <= 0) p.fd = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.gold
                ? `rgba(201,168,76,${p.op})`
                : `rgba(192,192,200,${p.op * 0.5})`;
            ctx.fill();
        });
    }
);

/* ─────────────────────────────────────────
   HERO — NÉVOA COM PARALLAX DO MOUSE
───────────────────────────────────────── */
(function () {
    if (REDUCED || !window.matchMedia('(pointer: fine)').matches) return;
    const hero = document.getElementById('home');
    if (!hero) return;
    const fog1 = hero.querySelector('.hero-fog-1');
    const fog2 = hero.querySelector('.hero-fog-2');
    if (!fog1 || !fog2) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    let active = false;
    let rafId = 0;

    function tick() {
        cx += (tx - cx) * 0.05;
        cy += (ty - cy) * 0.05;
        fog1.style.transform = `translate(${cx * -16}px,${cy * -10}px) scale(1.04)`;
        fog2.style.transform = `translate(${cx * 10}px,${cy * 7}px) scale(1.03)`;
        // Para quando estabiliza no centro (economia de CPU)
        if (!active && Math.abs(cx) < 0.001 && Math.abs(cy) < 0.001) { rafId = 0; return; }
        rafId = requestAnimationFrame(tick);
    }
    function wake() { if (!rafId) rafId = requestAnimationFrame(tick); }

    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        active = true;
        wake();
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
        tx = 0; ty = 0; active = false;
        wake();
    }, { passive: true });
})();

/* ─────────────────────────────────────────
   HERO — TILT 3D DO LIVRO
───────────────────────────────────────── */
(function () {
    if (REDUCED || !window.matchMedia('(pointer: fine)').matches) return;
    const book = document.getElementById('heroBook');
    if (!book) return;
    const img = book.querySelector('.hero-book-img');
    const wrap = book.closest('.hero-book-wrap');
    if (!img || !wrap) return;

    const MAX = 10; // graus

    wrap.addEventListener('mousemove', e => {
        const r = wrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform =
            `rotateY(${x * MAX}deg) rotateX(${-y * MAX}deg) scale(1.03)`;
    }, { passive: true });

    wrap.addEventListener('mouseleave', () => {
        img.style.transform = '';
    }, { passive: true });
})();

/* ─────────────────────────────────────────
   FUNDO ALTERNADO POR SEÇÃO
───────────────────────────────────────── */
(function () {
    const bg = document.querySelector('.site-bg');
    if (!bg) return;

    const observe = (selector, on) => {
        const els = document.querySelectorAll(selector);
        if (!els.length) return;
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) bg.classList.toggle('bg-alt', on);
            });
        }, { threshold: 0.3 });
        els.forEach(s => obs.observe(s));
    };
    observe('#lancamento, #autor, #wiki', true);
    observe('#home, #faq', false);
})();

/* ─────────────────────────────────────────
   HERO — SLIDESHOW (vídeo → imagem → imagem)
   O vídeo só é baixado depois do load da página.
───────────────────────────────────────── */
(function () {
    const video = document.getElementById('heroVideo');
    const slide1 = document.getElementById('heroSlide1');
    const slide2 = document.getElementById('heroSlide2');
    if (!video || !slide1 || !slide2) return;
    if (REDUCED) return; // fica no poster estático

    const IMAGE_DURATION = 5000;
    const FADE_MS = 1400;

    video.muted = true;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    async function imageSequence() {
        video.style.opacity = '0';
        slide1.classList.add('active');
        await wait(FADE_MS + IMAGE_DURATION);

        slide1.classList.remove('active');
        slide2.classList.add('active');
        await wait(FADE_MS + IMAGE_DURATION);

        slide2.classList.remove('active');
        video.currentTime = 0;
        video.style.opacity = '1';
        video.play().catch(imageSequence);
    }

    video.addEventListener('ended', imageSequence);

    function start() {
        // Autoplay bloqueado → circula apenas as imagens sobre o poster
        video.play().catch(imageSequence);
    }

    if (document.readyState === 'complete') start();
    else window.addEventListener('load', () => setTimeout(start, 300), { once: true });
})();
