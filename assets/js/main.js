/* ============================================================
   M. H. Formagini — main.js (v6)
   Sem dependências. Tudo respeita prefers-reduced-motion.
   ============================================================ */
'use strict';

document.documentElement.classList.replace('no-js', 'js');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────
   NAV + SCROLLSPY
───────────────────────────────────────── */
(function () {
    const navbar = document.getElementById('mainNavbar');
    const toggle = document.getElementById('navToggle');
    if (!navbar) return;

    const hero = document.getElementById('home');

    function closeMenu() {
        navbar.classList.remove('menu-open');
        if (toggle) {
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    function onScroll() {
        const threshold = hero ? hero.offsetHeight * 0.7 : 400;
        const past = window.scrollY > threshold;
        navbar.classList.toggle('visible', past);
        if (!past) closeMenu();
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
            if (!navbar.contains(e.target)) closeMenu();
        });
    }

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
   REVELAÇÕES DE ELEMENTO
   Um observador só, três comportamentos: fios que se desenham,
   arcos que crescem do rodapé e imagens reveladas por limpeza.
───────────────────────────────────────── */
(function () {
    // As imagens grandes trocam o "subir" pela limpeza de baixo para cima
    document.querySelectorAll('.artwork, .capa-frame').forEach(el => {
        el.classList.add('reveal--wipe');
    });

    const pairs = [['.drips', 'drawn'], ['.arch', 'grown'], ['.reveal--wipe', 'active']];
    const targets = new Map(); // container observado -> [[elemento, classe], ...]

    pairs.forEach(([sel, cls]) => {
        document.querySelectorAll(sel).forEach(el => {
            if (REDUCED) { el.classList.add(cls); return; }
            // Observa o container, não o próprio elemento. Todos os três
            // começam recortados ou achatados, e o IntersectionObserver leva
            // clip-path e transform em conta: eles nunca "entrariam" na tela
            // sozinhos e ficariam presos no estado inicial.
            const host = el.parentElement;
            if (!targets.has(host)) targets.set(host, []);
            targets.get(host).push([el, cls]);
        });
    });
    if (REDUCED || !targets.size) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            (targets.get(e.target) || []).forEach(([el, cls]) => el.classList.add(cls));
            obs.unobserve(e.target);
        });
    }, { threshold: 0.08 });
    targets.forEach((_, host) => obs.observe(host));
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
   ANDAMENTO — barras só preenchem ao entrar na tela
───────────────────────────────────────── */
(function () {
    const tracker = document.querySelector('.tracker');
    if (!tracker) return;
    if (REDUCED) { tracker.classList.add('active'); return; }
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                tracker.classList.add('active');
                obs.disconnect();
            }
        });
    }, { threshold: 0.25 });
    obs.observe(tracker);
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
    }, 1500);
})();

/* ─────────────────────────────────────────
   HERO — DERIVA SUAVE DO LIVRO COM O MOUSE
───────────────────────────────────────── */
(function () {
    if (REDUCED || !window.matchMedia('(pointer: fine)').matches) return;
    const book = document.getElementById('heroBook');
    const stage = book && book.closest('.hero-stage');
    if (!book || !stage) return;

    const MAX = 12; // px

    stage.addEventListener('mousemove', e => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        book.style.transform = `translate(${x * MAX}px, ${y * MAX}px)`;
    }, { passive: true });

    stage.addEventListener('mouseleave', () => {
        book.style.transform = '';
    }, { passive: true });
})();

/* ─────────────────────────────────────────
   POEIRA DE PAPEL
   Motas lentas suspensas no hero. Para fora da viewport e com a
   aba oculta, para não queimar bateria à toa.
───────────────────────────────────────── */
(function () {
    const canvas = document.getElementById('dust-canvas');
    if (!canvas || REDUCED) return;
    const ctx = canvas.getContext('2d');
    let motes = [], running = false, inView = false, rafId = 0;

    function build() {
        const host = canvas.parentElement;
        canvas.width = host.offsetWidth;
        canvas.height = host.offsetHeight;
        const n = Math.min(70, Math.floor((canvas.width * canvas.height) / 17000));
        motes = Array.from({ length: n }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.12,
            vy: -(Math.random() * 0.12 + 0.02),
            r: Math.random() * 1.5 + 0.4,
            op: Math.random() * 0.22 + 0.04,
            dir: Math.random() > 0.5 ? 1 : -1,
            fade: Math.random() * 0.0035 + 0.0008,
            max: Math.random() * 0.26 + 0.06,
            dark: Math.random() > 0.45,
        }));
    }

    function frame() {
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        motes.forEach(m => {
            m.x += m.vx;
            m.y += m.vy;
            m.op += m.dir * m.fade;
            if (m.op >= m.max) m.dir = -1;
            if (m.op <= 0.02) m.dir = 1;
            if (m.y < -6) { m.y = canvas.height + 6; m.x = Math.random() * canvas.width; }
            if (m.x < -6) m.x = canvas.width + 6;
            if (m.x > canvas.width + 6) m.x = -6;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
            ctx.fillStyle = m.dark
                ? `rgba(58,53,49,${m.op})`
                : `rgba(255,252,244,${m.op * 1.3})`;
            ctx.fill();
        });
        rafId = requestAnimationFrame(frame);
    }

    function sync() {
        const should = inView && !document.hidden;
        if (should && !running) { running = true; rafId = requestAnimationFrame(frame); }
        if (!should && running) { running = false; cancelAnimationFrame(rafId); }
    }

    new IntersectionObserver(e => { inView = e[0].isIntersecting; sync(); }).observe(canvas);
    document.addEventListener('visibilitychange', sync);

    let t = 0;
    window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(build, 180);
    }, { passive: true });

    build();
})();

/* ─────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────── */
(function () {
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    if (!box || !img || !cap || !closeBtn) return;

    const triggers = document.querySelectorAll('[data-lightbox]');
    if (!triggers.length) return;

    let lastFocused = null;

    function open(trigger) {
        lastFocused = trigger;
        img.src = trigger.dataset.lightbox;
        img.alt = trigger.querySelector('img')?.alt || '';
        cap.textContent = trigger.dataset.caption || '';
        box.hidden = false;
        document.body.classList.add('lightbox-open');
        // força reflow para a transição de opacidade rodar
        void box.offsetWidth;
        box.classList.add('open');
        closeBtn.focus();
    }

    function close() {
        box.classList.remove('open');
        document.body.classList.remove('lightbox-open');
        let timer = 0;
        const done = () => {
            clearTimeout(timer);
            box.hidden = true;
            img.src = '';
            box.removeEventListener('transitionend', done);
        };
        if (REDUCED) done();
        else {
            box.addEventListener('transitionend', done);
            timer = setTimeout(done, 500); // rede de segurança se a transição não disparar
        }
        if (lastFocused) lastFocused.focus();
    }

    triggers.forEach(t => t.addEventListener('click', () => open(t)));
    closeBtn.addEventListener('click', close);
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !box.hidden) close();
    });
})();
