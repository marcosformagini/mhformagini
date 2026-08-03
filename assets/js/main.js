/* ============================================================
   M. H. Formagini — main.js (v7)
   Sem dependências. Tudo respeita prefers-reduced-motion.

   LEI DO OBSERVER: todo elemento que nasce com clip-path ou
   transform (fios, arcos, wipes) registra o PAI no
   IntersectionObserver — o próprio nunca "entra" na tela.
   ============================================================ */
'use strict';

document.documentElement.classList.replace('no-js', 'js');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────
   NAV + SCROLLSPY + INDICADOR DE ROLAGEM
───────────────────────────────────────── */
(function () {
    const navbar = document.getElementById('mainNavbar');
    const toggle = document.getElementById('navToggle');
    if (!navbar) return;

    const hero = document.getElementById('home');
    const heroScroll = document.getElementById('heroScroll');

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
        // O indicador já cumpriu o papel no primeiro gesto de rolagem
        if (heroScroll && window.scrollY > 40) heroScroll.classList.add('hidden');
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
   REVELAÇÕES — um observador, cinco comportamentos
   .reveal / .reveal-list observam a si mesmos (só opacidade).
   Fios, arcos e wipes nascem recortados/achatados: registram o PAI.
───────────────────────────────────────── */
(function () {
    // Imagens grandes trocam o "subir" pela limpeza de prensa.
    // A classe vai no .zoom interno: legendas, selos e cruzetas dos
    // figures ficam fora do clip (negativos sumiriam no inset(0)).
    document.querySelectorAll('.capa-frame .zoom, .artwork .zoom, .map-plate .zoom')
        .forEach(el => el.classList.add('reveal--wipe'));

    const targets = new Map(); // elemento observado -> [[alvo, classe], ...]
    const add = (host, el, cls) => {
        if (!targets.has(host)) targets.set(host, []);
        targets.get(host).push([el, cls]);
    };

    // Auto-observados
    document.querySelectorAll('.reveal, .reveal-list').forEach(el => add(el, el, 'active'));
    // Lei do observer: o pai responde por quem nasce recortado
    document.querySelectorAll('.drips').forEach(el => add(el.parentElement, el, 'drawn'));
    document.querySelectorAll('.arch').forEach(el => add(el.parentElement, el, 'grown'));
    document.querySelectorAll('.reveal--wipe').forEach(el => add(el.parentElement, el, 'active'));

    if (REDUCED) {
        targets.forEach(list => list.forEach(([el, cls]) => el.classList.add(cls)));
        return;
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            (targets.get(e.target) || []).forEach(([el, cls]) => el.classList.add(cls));
            obs.unobserve(e.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    targets.forEach((_, host) => obs.observe(host));
})();

/* ─────────────────────────────────────────
   ANDAMENTO — as barras preenchem em cascata ao entrar na tela
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
   HERO — TINTA SECANDO NO SUBTÍTULO
   Determinístico, esquerda → direita, uma vez. O CSS agenda cada
   letra por --n; aqui só se monta e liga o interruptor.
───────────────────────────────────────── */
(function () {
    const el = document.getElementById('hero-saga');
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    let n = 0;
    for (const ch of text) {
        const s = document.createElement('span');
        s.textContent = ch;
        s.className = 'char';
        if (ch.trim()) s.style.setProperty('--n', n++);
        el.appendChild(s);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('lit')));
})();

/* ─────────────────────────────────────────
   HERO — DERIVA DO LIVRO COM PESO (lerp em rAF)
   Perseguição a 8% por frame: pesado como um livro, não como um
   cursor. Desliga sozinho em repouso; volta sem salto no leave.
───────────────────────────────────────── */
(function () {
    if (REDUCED || !window.matchMedia('(pointer: fine)').matches) return;
    const book = document.getElementById('heroBook');
    const stage = book && book.closest('.hero-stage');
    if (!book || !stage) return;

    const MAX = 10;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    function step() {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        book.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
        if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.05) {
            raf = requestAnimationFrame(step);
        } else {
            raf = 0;
        }
    }

    stage.addEventListener('mousemove', e => {
        const r = stage.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * MAX;
        ty = ((e.clientY - r.top) / r.height - 0.5) * MAX;
        if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });

    stage.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
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
