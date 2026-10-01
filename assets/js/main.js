/* ============================================================
   M. H. Formagini — main.js (v3)
   Sem dependências. Canvas pausa fora da viewport e com a
   aba oculta; tudo respeita prefers-reduced-motion.
   ============================================================ */
'use strict';

document.documentElement.classList.replace('no-js', 'js');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* O hero vira cena (bloco alto + palco preso) só com movimento liberado.
   A classe entra aqui, antes de os canvases medirem o palco. */
const HERO_LIVE = (() => {
    const hero = document.getElementById('home');
    if (!hero || REDUCED || !hero.querySelector('.cena-frame')) return null;
    hero.classList.add('is-live');
    return hero;
})();
const cenaHeat = { v: 0 }; // calor da cena, lido pelas brasas da pintura
const heroInk = { v: 1 };  // quanto da folha ainda aparece, lido pelas brasas do hero
let setNavActive = () => {}; // definido pela nav; o hero usa para Início / Pré-venda

/* ─────────────────────────────────────────
   NAV FLUTUANTE + SCROLLSPY
───────────────────────────────────────── */
(function () {
    const navbar = document.getElementById('mainNavbar');
    const toggle = document.getElementById('navToggle');
    if (!navbar) return;

    function onScroll() {
        // entra depois da primeira tela (o hero agora é um bloco alto)
        const threshold = window.innerHeight * 0.8;
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

    // ScrollSpy — [data-spy] empresta o link de outra seção
    const sections = document.querySelectorAll('section[id], [data-spy]');
    const navLinks = navbar.querySelectorAll('.nav-link');
    setNavActive = id => navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
    });
    const spy = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            // com a cena ligada, o próprio hero decide entre Início e Pré-venda
            if (HERO_LIVE && (e.target.id === 'home' || e.target.id === 'prevenda')) return;
            setNavActive(e.target.dataset.spy || e.target.id);
        });
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach(s => spy.observe(s));
})();

/* ─────────────────────────────────────────
   TÍTULOS DE SEÇÃO — palavra por palavra
   Cada palavra vira .w > .w-i; o CSS faz a .w-i subir de dentro da .w
   quando o cabeçalho (.reveal) ganha .active. Os <em> são percorridos
   por dentro, então o itálico de destaque continua onde estava.
───────────────────────────────────────── */
(function () {
    if (REDUCED) return;
    document.querySelectorAll('.sec-title').forEach(title => {
        let i = 0;
        const split = node => {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) { split(child); return; }
                if (child.nodeType !== Node.TEXT_NODE) return;
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach(part => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                    const w = document.createElement('span');
                    const inner = document.createElement('span');
                    w.className = 'w';
                    inner.className = 'w-i';
                    inner.style.setProperty('--wi', i++);
                    inner.textContent = part;
                    w.appendChild(inner);
                    frag.appendChild(w);
                });
                child.replaceWith(frag);
            });
        };
        split(title);
        title.classList.add('is-split');
    });
})();

/* ─────────────────────────────────────────
   IGNIÇÃO POR ROLAGEM — [data-ignite]
   As palavras acendem uma a uma enquanto o trecho atravessa a tela:
   começa quando o topo cruza 88% da altura e termina quando o fim
   cruza 42%. Rolar de volta apaga de novo.
───────────────────────────────────────── */
(function () {
    const els = document.querySelectorAll('[data-ignite]');
    if (!els.length || REDUCED) return;

    const items = [...els].map(el => {
        const words = [];
        const split = node => {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) { split(child); return; }
                if (child.nodeType !== Node.TEXT_NODE) return;
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach(part => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                    const w = document.createElement('span');
                    w.className = 'ig';
                    w.textContent = part;
                    words.push(w);
                    frag.appendChild(w);
                });
                child.replaceWith(frag);
            });
        };
        split(el);
        el.classList.add('is-ignite');
        return { el, words, lit: -1 };
    });

    let raf = 0;
    function update() {
        raf = 0;
        const vh = window.innerHeight;
        const start = vh * 0.88;
        items.forEach(it => {
            // data-ignite="0.66" termina mais cedo (fim do trecho a 66% da tela)
            const end = vh * (parseFloat(it.el.dataset.ignite) || 0.42);
            const r = it.el.getBoundingClientRect();
            if (r.bottom < -vh || r.top > vh * 2) return;
            const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + start - end)));
            const n = Math.round(p * it.words.length);
            if (n === it.lit) return;
            it.words.forEach((w, k) => w.classList.toggle('lit', k < n));
            it.lit = n;
        });
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
})();

/* ─────────────────────────────────────────
   PALCO DAS LEITURAS — [data-stage]
   As citações ficam presas no centro e se sucedem com a rolagem. Uma
   citação focada pelo teclado leva a rolagem até o trecho dela, para o
   foco nunca cair num texto invisível.
───────────────────────────────────────── */
(function () {
    const stages = document.querySelectorAll('[data-stage]');
    // sem overflow: clip a seção prenderia o sticky; fica a lista de sempre
    if (!stages.length || REDUCED || !CSS.supports('overflow', 'clip')) return;

    stages.forEach(stage => {
        const rows = [...stage.querySelectorAll('.quote-row')];
        const n = rows.length;
        if (!n) return;
        const count = stage.querySelector('.leituras-count');
        const total = stage.querySelector('.leituras-total');
        if (total) total.textContent = String(n).padStart(2, '0');
        stage.style.setProperty('--n', n);
        stage.classList.add('is-live');

        let raf = 0, near = false, cur = -1;
        const span = () => Math.max(1, stage.offsetHeight - window.innerHeight);

        function update() {
            raf = 0;
            const p = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / span()));
            stage.style.setProperty('--sp', p.toFixed(4));
            const i = Math.min(n - 1, Math.floor(p * n));
            if (i === cur) return;
            cur = i;
            rows.forEach((row, k) => row.classList.toggle('is-on', k === i));
            if (count) count.textContent = String(i + 1).padStart(2, '0');
        }
        const schedule = () => { if (near && !raf) raf = requestAnimationFrame(update); };

        new IntersectionObserver(([e]) => {
            near = e.isIntersecting;
            schedule();
        }, { rootMargin: '20% 0px' }).observe(stage);
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });

        rows.forEach((row, k) => row.addEventListener('focusin', () => {
            if (k === cur) return;
            const top = stage.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: top + ((k + 0.5) / n) * span(), behavior: 'instant' });
        }));

        update();
    });
})();

/* ─────────────────────────────────────────
   TRACKER — até onde o pavio queima
   Mede a posição do ponto da última etapa concluída (ou quase) e
   grava a fração em --fill; o CSS anima a linha até lá.
───────────────────────────────────────── */
(function () {
    const steps = document.querySelector('.progress-steps');
    if (!steps) return;
    function measure() {
        const all = [...steps.querySelectorAll('.progress-step')];
        const lit = steps.querySelectorAll('.progress-step--done, .progress-step--almost');
        if (all.length < 2 || !lit.length) { steps.style.setProperty('--fill', 0); return; }
        const dotY = step => {
            const d = step.querySelector('.progress-dot');
            return d.offsetTop + d.offsetHeight / 2;
        };
        // a linha do CSS vai de 12px até (altura - 12px) do .progress-steps
        const upTo = dotY(lit[lit.length - 1]);
        const fill = (upTo - 12) / Math.max(1, steps.clientHeight - 24);
        steps.style.setProperty('--fill', Math.min(1, Math.max(0, fill)).toFixed(4));
    }
    measure();
    window.addEventListener('resize', measure, { passive: true });
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
   TRILHO CARMESIM DAS SEÇÕES
   Observador próprio: o trilho tem a altura inteira da seção, então
   threshold 0.1 poderia nunca ser atingido em seções muito longas.
───────────────────────────────────────── */
(function () {
    const rails = document.querySelectorAll('.sec-rail');
    if (!rails.length) return;
    if (REDUCED) {
        rails.forEach(r => r.classList.add('active'));
        return;
    }
    // Observa a SEÇÃO, não o trilho: o trilho nasce com clip-path zerando
    // sua área visível, e nesse estado o IntersectionObserver pode nunca
    // considerá-lo visível.
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.querySelector('.sec-rail')?.classList.add('active');
            obs.unobserve(e.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    rails.forEach(r => {
        const sec = r.closest('.section--railed');
        if (sec) obs.observe(sec);
    });
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

/* Cinzas do hero — na luz prata, cinza clara e algumas brasas */
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
            gold: Math.random() > 0.8,
        });
        return { make, embers: Array.from({ length: n }, () => make(true)) };
    },
    (ctx, cv, st) => {
        if (heroInk.v < 0.02) return; // o fogo já tomou o céu
        st.embers.forEach((e, i) => {
            e.wobble += e.wSpeed;
            e.x += e.vx + Math.sin(e.wobble) * 0.25;
            e.y += e.vy;
            e.life -= e.decay;
            if (e.life <= 0 || e.y < -10) { st.embers[i] = st.make(false); return; }
            const a = e.life * e.base;
            if (a < 0.01) return;
            // Sobre a pintura prata: cinza clara e, de vez em quando, uma brasa
            const [r, g, b] = e.gold ? [217, 88, 75] : [214, 209, 200];
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
                ? `rgba(217,88,75,${p.op})`
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
                ? `rgba(158,43,34,${p.op * 0.7})`
                : `rgba(61,56,48,${p.op * 0.45})`;
            ctx.fill();
        });
    }
);

/* ─────────────────────────────────────────
   HERO + CENA — duas luzes: a home na prata, a pré-venda no vermelho
   Prata: a home sobre a pintura em tela cheia. Rolando, a home sai, o céu
   pega fogo a partir do portão, e a pré-venda (#prevenda, trazida para
   dentro do palco) toma a tela. No fim a moldura fecha numa prancha.
   Escreve no #home as variáveis que o CSS usa (--out, --burn, --pre,
   --exit, --p, --fx). O alvo vem da rolagem; o valor exibido persegue
   o alvo com inércia, então a roda do mouse não dá trancos.
───────────────────────────────────────── */
(function () {
    const hero = HERO_LIVE;
    if (!hero) return;

    const sticky = hero.querySelector('.hero-sticky');
    const inner = hero.querySelector('.hero-inner');
    const stage = hero.querySelector('.hero-stage');
    const pv = document.getElementById('prevenda');
    if (pv) sticky.appendChild(pv); // a pré-venda vira o vermelho da cena

    // Linha do tempo (progresso da cena presa, 0 → 1)
    const T = {
        out:  [0.1, 0.22],   // a home sai
        burn: [0.14, 0.5],   // o céu pega fogo: prata → vermelho
        pre:  [0.46, 0.56],  // a pré-venda entra
        exit: [0.88, 1],     // a moldura fecha
        preAt: 0.7,          // onde o link #prevenda para
    };

    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const seg = (v, [a, b]) => clamp((v - a) / (b - a));
    const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let tP = 0, cP = 0, out = 0, raf = 0, near = true, navId = '';

    // título + livro precisam caber no palco preso: encolhe se faltar altura
    function fit() {
        const need = inner.offsetHeight;
        const room = stage.clientHeight;
        inner.style.setProperty('--fit', need > room ? (room / need).toFixed(3) : '1');
    }

    function measure() {
        const r = hero.getBoundingClientRect();
        tP = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    }

    function paint(snap) {
        raf = 0;
        cP += (tP - cP) * (snap === true ? 1 : 0.14);
        if (Math.abs(tP - cP) < 1e-4) cP = tP;

        out = easeInOut(seg(cP, T.out));
        const burn = easeInOut(seg(cP, T.burn));
        const pre = easeInOut(seg(cP, T.pre));
        const exit = easeInOut(seg(cP, T.exit));
        const fx = 0.64 - 0.2 * easeInOut(seg(cP, [0.14, 0.7]));
        const s = hero.style;
        s.setProperty('--out', out.toFixed(4));
        s.setProperty('--burn', burn.toFixed(4));
        s.setProperty('--pre', pre.toFixed(4));
        s.setProperty('--exit', exit.toFixed(4));
        s.setProperty('--p', cP.toFixed(4));
        s.setProperty('--fx', fx.toFixed(4));

        inner.classList.toggle('is-gone', out > 0.5);
        if (pv) pv.classList.toggle('is-on', pre > 0.4 && exit < 0.6);

        // enquanto a cena está presa, ela decide o link aceso da nav
        if (tP < 1) {
            const id = cP >= T.pre[0] ? 'prevenda' : 'home';
            if (id !== navId) { navId = id; setNavActive(id); }
        } else navId = '';

        heroInk.v = 1 - burn;
        // brasas: nenhuma na prata, pico no meio do fogo, brasido no vermelho
        cenaHeat.v = Math.min(1, burn * 1.8) * (0.5 + 0.5 * Math.sin(Math.PI * burn)) * (1 - exit);

        if (cP !== tP) raf = requestAnimationFrame(paint);
    }

    function schedule() {
        if (!near) return;
        measure();
        if (!raf) raf = requestAnimationFrame(paint);
    }

    new IntersectionObserver(([e]) => {
        near = e.isIntersecting;
        if (!near) navId = '';
        schedule();
    }).observe(hero);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => { fit(); schedule(); }, { passive: true });

    // Foco do teclado num botão da home já apagada: volta ao começo,
    // para o foco nunca cair num elemento invisível
    inner.addEventListener('focusin', () => {
        if (out > 0.3) window.scrollTo({ top: 0, behavior: 'instant' });
    });

    // #prevenda mora dentro do palco preso: o link leva ao ponto da
    // rolagem em que o vermelho já tomou a tela
    const preTop = () => hero.getBoundingClientRect().top + window.scrollY
        + T.preAt * (hero.offsetHeight - window.innerHeight);
    document.querySelectorAll('a[href="#prevenda"]').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: preTop(), behavior: 'smooth' });
        if (location.hash !== '#prevenda') history.pushState(null, '', '#prevenda');
    }));
    if (pv) pv.addEventListener('focusin', () => {
        if (!pv.classList.contains('is-on')) window.scrollTo({ top: preTop(), behavior: 'instant' });
    });
    if (location.hash === '#prevenda') {
        const go = () => window.scrollTo({ top: preTop(), behavior: 'instant' });
        go();
        window.addEventListener('load', go, { once: true });
    }

    fit();
    if (document.fonts) document.fonts.ready.then(fit);
    // estado inicial correto já no primeiro quadro (ex.: recarregar no meio da página)
    measure();
    paint(true);
})();

/* ─────────────────────────────────────────
   PRÉ-VENDA — a contagem
   Lê data-abre e data-fecha do #prevenda, troca a fase sozinho
   (antes → aberta → encerrada) e conta até o próximo marco. Cada
   algarismo é um span: só o que mudou ganha a animação de troca.
───────────────────────────────────────── */
(function () {
    const pv = document.getElementById('prevenda');
    if (!pv) return;
    const abre = Date.parse(pv.dataset.abre);
    const fecha = Date.parse(pv.dataset.fecha);
    if (isNaN(abre) || isNaN(fecha)) return;

    const unit = k => pv.querySelector(`[data-u="${k}"]`);
    const label = k => pv.querySelector(`[data-l="${k}"]`);
    const U = { d: unit('d'), h: unit('h'), m: unit('m'), s: unit('s') };
    const L = { d: label('d'), h: label('h') };
    const next = pv.querySelector('[data-next]');
    const pad = n => String(n).padStart(2, '0');
    const split = ms => {
        const t = Math.max(0, Math.floor(ms / 1000));
        return { d: Math.floor(t / 86400), h: Math.floor(t % 86400 / 3600), m: Math.floor(t % 3600 / 60), s: t % 60 };
    };

    function setDigits(el, str) {
        if (!el) return;
        if (el.dataset.v === undefined) el.textContent = '';
        while (el.children.length < str.length) el.appendChild(document.createElement('span'));
        while (el.children.length > str.length) el.lastElementChild.remove();
        [...str].forEach((ch, i) => {
            const sp = el.children[i];
            if (sp.textContent === ch) return;
            const first = sp.textContent === '';
            sp.textContent = ch;
            if (!first && !REDUCED && sp.animate) {
                sp.animate(
                    [{ transform: 'translateY(45%)', opacity: 0, filter: 'blur(5px)' },
                     { transform: 'none', opacity: 1, filter: 'none' }],
                    { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            }
        });
        el.dataset.v = str;
    }

    function tick() {
        const now = Date.now();
        const fase = now < abre ? 'antes' : now < fecha ? 'aberta' : 'encerrada';
        if (pv.dataset.fase !== fase) pv.dataset.fase = fase;
        if (fase === 'encerrada') return;

        const t = split((fase === 'antes' ? abre : fecha) - now);
        setDigits(U.d, pad(t.d));
        setDigits(U.h, pad(t.h));
        setDigits(U.m, pad(t.m));
        setDigits(U.s, pad(t.s));
        if (L.d) L.d.textContent = t.d === 1 ? 'dia' : 'dias';
        if (L.h) L.h.textContent = t.h === 1 ? 'hora' : 'horas';

        // a próxima contagem, discreta: quanto falta para a pré-venda acabar
        if (next && fase === 'antes') {
            const n = split(fecha - now);
            next.textContent = `${n.d}d ${pad(n.h)}h ${pad(n.m)}m ${pad(n.s)}s`;
        }
    }

    tick();
    // alinhado à virada de cada segundo do relógio
    (function loop() {
        setTimeout(() => { tick(); loop(); }, 1000 - (Date.now() % 1000) + 5);
    })();
})();

/* Brasas da cena — sobem do chão quando o céu pega fogo */
createCanvasScene(
    document.getElementById('cena-canvas'),
    cv => {
        const n = Math.min(90, Math.floor((cv.width * cv.height) / 16000));
        const make = scattered => ({
            x: Math.random() * cv.width,
            y: scattered ? Math.random() * cv.height : cv.height + 10,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -(Math.random() * 0.9 + 0.35),
            size: Math.random() * 1.8 + 0.4,
            base: Math.random() * 0.6 + 0.25,
            life: scattered ? Math.random() : 1,
            decay: Math.random() * 0.003 + 0.001,
            wobble: Math.random() * Math.PI * 2,
            wSpeed: Math.random() * 0.03 + 0.008,
            hot: Math.random() > 0.3,
        });
        return { make, embers: Array.from({ length: n }, () => make(true)) };
    },
    (ctx, cv, st) => {
        const heat = cenaHeat.v;
        st.embers.forEach((e, i) => {
            e.wobble += e.wSpeed;
            e.x += e.vx + Math.sin(e.wobble) * 0.3;
            e.y += e.vy * (0.6 + heat);
            e.life -= e.decay;
            if (e.life <= 0 || e.y < -10) { st.embers[i] = st.make(false); return; }
            const a = e.life * e.base * heat;
            if (a < 0.01) return;
            const [r, g, b] = e.hot ? [255, 128, 72] : [217, 88, 75];
            const gr = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3);
            gr.addColorStop(0, `rgba(${r},${g},${b},${a})`);
            gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = gr;
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
    observe('#home, #capa, #leituras, #faq', false);
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

/* ─────────────────────────────────────────
   LIGHTBOX — imagens da seção A Capa
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

/* ─────────────────────────────────────────
   A CAPA — o livro gira com a rolagem
   Escreve --turn e --glint no .unveil-stage: a quarta capa encara a
   tela, depois a lombada, depois a capa; .is-done carimba o selo e
   traz os créditos. Foco do teclado na capa leva ao fim do giro.
───────────────────────────────────────── */
(function () {
    const stage = document.querySelector('[data-unveil]');
    if (!stage || REDUCED) return;
    stage.classList.add('is-live');

    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const seg = (v, a, b) => clamp((v - a) / (b - a));
    const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let tP = 0, cP = 0, raf = 0, near = false;
    // o giro começa um pouco antes de o palco prender (topo a 35% da tela)
    const LEAD = 0.35;

    function measure() {
        const r = stage.getBoundingClientRect();
        const vh = window.innerHeight;
        tP = clamp((vh * LEAD - r.top) / Math.max(1, r.height - vh + vh * LEAD));
    }

    function paint(snap) {
        raf = 0;
        cP += (tP - cP) * (snap === true ? 1 : 0.14);
        if (Math.abs(tP - cP) < 1e-4) cP = tP;
        const turn = easeInOut(seg(cP, 0.04, 0.7));
        stage.style.setProperty('--turn', turn.toFixed(4));
        stage.style.setProperty('--glint', seg(cP, 0.62, 0.92).toFixed(4));
        stage.classList.toggle('is-done', turn > 0.97);
        if (cP !== tP) raf = requestAnimationFrame(paint);
    }

    function schedule() {
        if (!near) return;
        measure();
        if (!raf) raf = requestAnimationFrame(paint);
    }

    new IntersectionObserver(([e]) => {
        near = e.isIntersecting;
        schedule();
    }, { rootMargin: '20% 0px' }).observe(stage);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    const zoom = stage.querySelector('.b3-front .zoom');
    if (zoom) zoom.addEventListener('focus', () => {
        if (stage.classList.contains('is-done')) return;
        const top = stage.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + 0.85 * (stage.offsetHeight - window.innerHeight), behavior: 'instant' });
    });

    measure();
    paint(true);
})();

/* ─────────────────────────────────────────
   DETALHES DA OBRA — o fragmento pega fogo
   No mouse, a chama nasce de onde o ponteiro entrou (--ix/--iy); o
   CSS faz o resto no :hover. No toque, acende quando o fragmento
   cruza o meio da tela.
───────────────────────────────────────── */
(function () {
    const frags = document.querySelectorAll('.frag');
    if (!frags.length) return;
    frags.forEach(f => f.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        const r = f.querySelector('.frag-art').getBoundingClientRect();
        f.style.setProperty('--ix', (clampPct((e.clientX - r.left) / r.width)) + '%');
        f.style.setProperty('--iy', (clampPct((e.clientY - r.top) / r.height)) + '%');
    }));
    function clampPct(v) { return Math.round(Math.min(1, Math.max(0, v)) * 100); }

    if (window.matchMedia('(hover: none)').matches) {
        const io = new IntersectionObserver(entries => entries.forEach(e => {
            e.target.classList.toggle('is-lit', e.isIntersecting);
        }), { rootMargin: '-38% 0px -38% 0px' });
        frags.forEach(f => io.observe(f));
    }
})();
