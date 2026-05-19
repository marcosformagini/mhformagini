const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
}

class Particle {
    constructor(type) {
        this.type = type || 'normal';
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.isSilver = Math.random() > 0.6;

        if (this.type === 'glow') {
            this.size = Math.random() * 4 + 2;
            this.opacity = Math.random() * 0.2 + 0.05;
            this.fadeSpeed = Math.random() * 0.003 + 0.001;
            this.maxOpacity = 0.3;
        } else if (this.type === 'drift') {
            this.size = Math.random() * 1.5 + 0.3;
            this.opacity = Math.random() * 0.6 + 0.1;
            this.fadeSpeed = Math.random() * 0.008 + 0.003;
            this.maxOpacity = 0.7;
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = (Math.random() - 0.5) * 0.01;
            this.radius = Math.random() * 30 + 10;
            this.centerX = this.x;
            this.centerY = this.y;
        } else {
            this.size = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.maxOpacity = 0.6;
        }
    }

    update() {
        if (this.type === 'drift') {
            this.angle += this.angleSpeed;
            this.x = this.centerX + Math.cos(this.angle) * this.radius;
            this.y = this.centerY + Math.sin(this.angle) * this.radius;
            this.centerX += this.speedX * 0.3;
            this.centerY += this.speedY * 0.3;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;
        }

        this.opacity += this.fadeDirection * this.fadeSpeed;
        if (this.opacity >= this.maxOpacity) this.fadeDirection = -1;
        if (this.opacity <= 0.02) this.fadeDirection = 1;

        if (this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        if (this.type === 'glow') {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            if (this.isSilver) {
                gradient.addColorStop(0, `rgba(220, 220, 230, ${this.opacity})`);
                gradient.addColorStop(1, `rgba(192, 192, 192, 0)`);
            } else {
                gradient.addColorStop(0, `rgba(232, 212, 139, ${this.opacity})`);
                gradient.addColorStop(1, `rgba(201, 168, 76, 0)`);
            }
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            if (this.isSilver) {
                ctx.fillStyle = `rgba(192, 192, 192, ${this.opacity * 0.7})`;
            } else {
                ctx.fillStyle = `rgba(201, 168, 76, ${this.opacity})`;
            }
        }
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const area = canvas.width * canvas.height;
    const normalCount = Math.min(60, Math.floor(area / 18000));
    const glowCount = Math.min(20, Math.floor(area / 50000));
    const driftCount = Math.min(15, Math.floor(area / 60000));

    for (let i = 0; i < normalCount; i++) particles.push(new Particle('normal'));
    for (let i = 0; i < glowCount; i++) particles.push(new Particle('glow'));
    for (let i = 0; i < driftCount; i++) particles.push(new Particle('drift'));
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    animationId = requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

resizeCanvas();
initParticles();
animateParticles();

// ===== SCROLL REVEAL ANIMATION =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.querySelector('.navbar-custom');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.borderBottomColor = 'rgba(201, 168, 76, 0.2)';
    } else {
        navbar.style.borderBottomColor = 'rgba(201, 168, 76, 0.1)';
    }
});

// ===== SCROLLSPY INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll ao clicar nos links da navbar
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const offset = 70;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
            // Fechar menu mobile se aberto
            const navCollapse = document.querySelector('#navContent');
            if (navCollapse.classList.contains('show')) {
                new bootstrap.Collapse(navCollapse).hide();
            }
        });
    });

    // Custom ScrollSpy com IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => scrollObserver.observe(section));

    // ===== HERO SAGA — EMBER IGNITION =====
    const sagaEl = document.getElementById('hero-saga');
    if (sagaEl) {
        const text = sagaEl.textContent;
        sagaEl.innerHTML = '';
        const chars = [];
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.classList.add('char');
            sagaEl.appendChild(span);
            if (text[i].trim()) chars.push(span);
        }

        // Start ignition after reveal animation completes
        setTimeout(() => {
            let litCount = 0;
            const total = chars.length;
            const ignition = setInterval(() => {
                const unlit = chars.filter(c => !c.classList.contains('lit'));
                if (unlit.length === 0) {
                    clearInterval(ignition);
                    return;
                }
                // Light 1-2 random chars per tick
                const burst = Math.min(Math.floor(Math.random() * 2) + 1, unlit.length);
                for (let i = 0; i < burst; i++) {
                    const pick = unlit[Math.floor(Math.random() * unlit.length)];
                    pick.classList.add('lit');
                    // Remove from unlit pool
                    const idx = unlit.indexOf(pick);
                    if (idx > -1) unlit.splice(idx, 1);
                }
            }, 120);
        }, 1800);
    }

    // ===== UNIVERSE MAPS — NAVIGATION =====
    const mapSlides = document.querySelectorAll('.universe-map-slide');
    const mapBtns = document.querySelectorAll('.universe-map-btn');
    const hotspot = document.getElementById('hotspot-messio');

    function showMap(mapId) {
        mapSlides.forEach(slide => {
            slide.classList.remove('active');
            if (slide.id === mapId) {
                slide.classList.add('active');
            }
        });
        mapBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.map === mapId) {
                btn.classList.add('active');
            }
        });
    }

    mapBtns.forEach(btn => {
        btn.addEventListener('click', () => showMap(btn.dataset.map));
    });

    if (hotspot) {
        hotspot.addEventListener('click', () => showMap('map-messio'));
    }

    // ===== UNIVERSE MAPS — MAGNIFYING LENS (desktop) & LIGHTBOX (mobile) =====
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const ZOOM = 3;
    const LENS_SIZE = 600;

    // Lightbox for mobile
    if (isMobile) {
        const lightbox = document.createElement('div');
        lightbox.id = 'map-lightbox';
        lightbox.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(10,10,15,0.95);display:none;align-items:center;justify-content:center;padding:1rem;';
        lightbox.innerHTML = '<img style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;" alt="Mapa expandido"><div style="position:absolute;top:1rem;right:1.5rem;color:var(--gold);font-size:2rem;cursor:pointer;z-index:10;">&times;</div>';
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('img');
        const lightboxClose = lightbox.querySelector('div');

        lightboxClose.addEventListener('click', () => { lightbox.style.display = 'none'; });
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.style.display = 'none'; });

        document.querySelectorAll('.universe-map-img').forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.style.display = 'flex';
            });
        });
    } else {
        // Lens for desktop
        document.querySelectorAll('.universe-map-wrapper').forEach(wrapper => {
            const img = wrapper.querySelector('.universe-map-img');
            const lens = wrapper.querySelector('.universe-map-lens');
            if (!img || !lens) return;

            wrapper.addEventListener('mouseenter', () => {
                lens.classList.add('active');
            });

            wrapper.addEventListener('mouseleave', () => {
                lens.classList.remove('active');
            });

            wrapper.addEventListener('mousemove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Position lens centered on cursor
                lens.style.left = (x - LENS_SIZE / 2) + 'px';
                lens.style.top = (y - LENS_SIZE / 2) + 'px';

                // Calculate background position for zoom
                const displayWidth = img.offsetWidth;
                const displayHeight = img.offsetHeight;

                // Percentage position of cursor on the image
                const percX = x / displayWidth;
                const percY = y / displayHeight;

                // Background size = image zoomed
                const bgWidth = displayWidth * ZOOM;
                const bgHeight = displayHeight * ZOOM;

                // Background position to center the zoomed area under the lens
                const bgX = -(percX * bgWidth - LENS_SIZE / 2);
                const bgY = -(percY * bgHeight - LENS_SIZE / 2);

                lens.style.backgroundImage = `url('${img.src}')`;
                lens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
                lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
            });
        });
    }
});



// ===== FAQ DEEP SPACE PARTICLES =====
(function() {
    const faqCanvas = document.getElementById('faq-canvas');
    if (!faqCanvas) return;
    const faqCtx = faqCanvas.getContext('2d');
    const faqSection = faqCanvas.parentElement;
    let faqParticles = [];

    function resizeFaqCanvas() {
        faqCanvas.width = faqSection.offsetWidth;
        faqCanvas.height = faqSection.offsetHeight;
    }

    function initFaqParticles() {
        resizeFaqCanvas();
        faqParticles = [];
        const count = Math.floor((faqCanvas.width * faqCanvas.height) / 3000);
        for (let i = 0; i < count; i++) {
            faqParticles.push({
                x: Math.random() * faqCanvas.width,
                y: Math.random() * faqCanvas.height,
                size: Math.random() * 2.5 + 0.3,
                opacity: Math.random() * 0.5,
                fadeSpeed: Math.random() * 0.008 + 0.002,
                fadeDir: Math.random() > 0.5 ? 1 : -1,
                maxOpacity: Math.random() * 0.5 + 0.2,
                isSilver: Math.random() > 0.6
            });
        }
    }

    function animateFaqParticles() {
        faqCtx.clearRect(0, 0, faqCanvas.width, faqCanvas.height);

        faqParticles.forEach(p => {
            p.opacity += p.fadeDir * p.fadeSpeed;
            if (p.opacity >= p.maxOpacity) p.fadeDir = -1;
            if (p.opacity <= 0) p.fadeDir = 1;

            const r = p.isSilver ? 192 : 201;
            const g = p.isSilver ? 192 : 168;
            const b = p.isSilver ? 192 : 76;

            faqCtx.beginPath();
            faqCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            faqCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
            faqCtx.fill();
        });

        requestAnimationFrame(animateFaqParticles);
    }

    window.addEventListener('resize', initFaqParticles);
    initFaqParticles();
    animateFaqParticles();
})();


// ===== FAQ FOCUS EFFECT =====
(function() {
    const faqItems = document.querySelectorAll('#faqAccordion .accordion-item');
    if (!faqItems.length) return;

    document.getElementById('faqAccordion').addEventListener('show.bs.collapse', (e) => {
        const openItem = e.target.closest('.accordion-item');
        faqItems.forEach(item => {
            if (item === openItem) {
                item.classList.add('faq-active');
                item.classList.remove('faq-blur');
            } else {
                item.classList.add('faq-blur');
                item.classList.remove('faq-active');
            }
        });
    });

    document.getElementById('faqAccordion').addEventListener('hidden.bs.collapse', () => {
        faqItems.forEach(item => {
            item.classList.remove('faq-blur', 'faq-active');
        });
    });
})();
