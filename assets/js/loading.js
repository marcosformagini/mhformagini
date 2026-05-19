(function() {
    const loadCanvas = document.getElementById('loading-canvas');
    const loadCtx = loadCanvas.getContext('2d');
    const loadScreen = document.getElementById('loading-screen');
    let particles = [];
    let centerX, centerY;
    let loadFrame = 0;
    let orbRadius = 12;
    let finished = false;
    let heat = 0;

    function resizeLoadCanvas() {
        loadCanvas.width = window.innerWidth;
        loadCanvas.height = window.innerHeight;
        centerX = loadCanvas.width / 2;
        centerY = loadCanvas.height / 2;
    }

    resizeLoadCanvas();
    window.addEventListener('resize', resizeLoadCanvas);

    let readyToBurn = false;
    let sparks = [];

    function animateLoading() {
        if (finished) return;
        loadCtx.globalCompositeOperation = 'source-over';
        loadCtx.fillStyle = '#0A0A0F';
        loadCtx.fillRect(0, 0, loadCanvas.width, loadCanvas.height);
        loadFrame++;

        // Breathing ember cycle
        const cycle = loadFrame * 0.025;
        const breath = Math.pow(Math.abs(Math.sin(cycle)), 0.7);
        const intensity = breath;

        // Detect peak (when ember is brightest) to spawn sparks
        const prevBreath = Math.pow(Math.abs(Math.sin((loadFrame - 1) * 0.025)), 0.7);
        if (breath > 0.9 && prevBreath <= 0.9) {
            // Spark burst
            const count = Math.floor(Math.random() * 5) + 4;
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1.5;
                sparks.push({
                    x: centerX,
                    y: centerY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - Math.random() * 2,
                    size: Math.random() * 2.5 + 0.8,
                    life: 1,
                    decay: Math.random() * 0.015 + 0.008
                });
            }

            // If ready to burn, ignite on this peak
            if (readyToBurn) {
                burnReveal();
                return;
            }
        }

        // Draw ember orb
        const pulse = 10 + intensity * 14;

        // Outer glow
        const outerGrad = loadCtx.createRadialGradient(centerX, centerY, pulse * 0.3, centerX, centerY, pulse * 3.5);
        outerGrad.addColorStop(0, `rgba(200, 60, 10, ${intensity * 0.2})`);
        outerGrad.addColorStop(0.5, `rgba(150, 30, 5, ${intensity * 0.07})`);
        outerGrad.addColorStop(1, 'rgba(100, 20, 5, 0)');
        loadCtx.beginPath();
        loadCtx.arc(centerX, centerY, pulse * 3.5, 0, Math.PI * 2);
        loadCtx.fillStyle = outerGrad;
        loadCtx.fill();

        // Mid orange
        const midGrad = loadCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse * 1.2);
        midGrad.addColorStop(0, `rgba(255, 140, 30, ${intensity * 0.8})`);
        midGrad.addColorStop(0.6, `rgba(220, 80, 15, ${intensity * 0.35})`);
        midGrad.addColorStop(1, 'rgba(180, 40, 5, 0)');
        loadCtx.beginPath();
        loadCtx.arc(centerX, centerY, pulse * 1.2, 0, Math.PI * 2);
        loadCtx.fillStyle = midGrad;
        loadCtx.fill();

        // Core white-hot
        const coreGrad = loadCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse * 0.5);
        coreGrad.addColorStop(0, `rgba(255, 255, 220, ${intensity})`);
        coreGrad.addColorStop(0.5, `rgba(255, 200, 80, ${intensity * 0.7})`);
        coreGrad.addColorStop(1, 'rgba(255, 120, 20, 0)');
        loadCtx.beginPath();
        loadCtx.arc(centerX, centerY, pulse * 0.5, 0, Math.PI * 2);
        loadCtx.fillStyle = coreGrad;
        loadCtx.fill();

        // Update and draw sparks
        sparks.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.03; // gravity
            s.vx *= 0.99;
            s.life -= s.decay;
        });
        sparks = sparks.filter(s => s.life > 0);

        sparks.forEach(s => {
            loadCtx.beginPath();
            loadCtx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
            loadCtx.fillStyle = `rgba(255, ${Math.round(120 * s.life)}, ${Math.round(20 * s.life)}, ${s.life})`;
            loadCtx.fill();
        });

        requestAnimationFrame(animateLoading);
    }

    animateLoading();

    // === BURN REVEAL using clip-path ===
    function burnReveal() {
        finished = true;
        loadCtx.clearRect(0, 0, loadCanvas.width, loadCanvas.height);

        // Calculate max radius needed to cover entire screen from center
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY) + 50;
        let burnRadius = 0;
        let emberParticles = [];

        // Create an overlay div for the burn (separate from canvas)
        const burnOverlay = document.createElement('div');
        burnOverlay.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;';
        document.body.appendChild(burnOverlay);

        // Create ember canvas on top
        const emberCanvas = document.createElement('canvas');
        emberCanvas.width = loadCanvas.width;
        emberCanvas.height = loadCanvas.height;
        emberCanvas.style.cssText = 'position:fixed;inset:0;z-index:100000;pointer-events:none;';
        document.body.appendChild(emberCanvas);
        const emberCtx = emberCanvas.getContext('2d');

        function spawnEmbers() {
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = burnRadius + (Math.random() - 0.5) * 30;
                emberParticles.push({
                    x: centerX + Math.cos(angle) * dist,
                    y: centerY + Math.sin(angle) * dist,
                    vx: (Math.random() - 0.5) * 2.5,
                    vy: -(Math.random() * 2.5 + 0.5),
                    size: Math.random() * 3 + 1,
                    life: 1,
                    decay: Math.random() * 0.012 + 0.006
                });
            }
        }

        // Irregular burn edge using noise
        function getIrregularRadius(angle, baseRadius) {
            // Multiple sine waves at different frequencies for organic look
            const n1 = Math.sin(angle * 3 + baseRadius * 0.02) * 15;
            const n2 = Math.sin(angle * 7 - baseRadius * 0.015) * 8;
            const n3 = Math.sin(angle * 13 + baseRadius * 0.03) * 5;
            const n4 = Math.sin(angle * 2 + 1.5) * 12;
            return baseRadius + n1 + n2 + n3 + n4;
        }

        function drawIrregularBurnShape(ctx, baseRadius, operation) {
            ctx.beginPath();
            const steps = 120;
            for (let i = 0; i <= steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const r = getIrregularRadius(angle, baseRadius);
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
        }

        function animateBurn() {
            burnRadius += 14;
            spawnEmbers();

            loadCtx.clearRect(0, 0, loadCanvas.width, loadCanvas.height);

            // Draw dark background
            loadCtx.fillStyle = '#0A0A0F';
            loadCtx.fillRect(0, 0, loadCanvas.width, loadCanvas.height);

            // Cut out irregular burn hole
            loadCtx.save();
            loadCtx.globalCompositeOperation = 'destination-out';
            drawIrregularBurnShape(loadCtx, burnRadius);
            loadCtx.fill();
            loadCtx.restore();

            // Draw burn edge glow — wider and more dissipated
            if (burnRadius < maxRadius) {
                loadCtx.save();
                loadCtx.globalCompositeOperation = 'source-over';

                // Number of glow points scales with circumference
                const steps = Math.max(120, Math.floor(burnRadius * 0.8));
                const glowSize = 45;
                for (let i = 0; i <= steps; i++) {
                    const angle = (i / steps) * Math.PI * 2;
                    const r = getIrregularRadius(angle, burnRadius);
                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;

                    const glowGrad = loadCtx.createRadialGradient(x, y, 0, x, y, glowSize);
                    glowGrad.addColorStop(0, 'rgba(255, 160, 30, 0.5)');
                    glowGrad.addColorStop(0.3, 'rgba(255, 80, 10, 0.3)');
                    glowGrad.addColorStop(0.6, 'rgba(180, 30, 5, 0.1)');
                    glowGrad.addColorStop(1, 'rgba(100, 10, 0, 0)');
                    loadCtx.beginPath();
                    loadCtx.arc(x, y, glowSize, 0, Math.PI * 2);
                    loadCtx.fillStyle = glowGrad;
                    loadCtx.fill();
                }

                loadCtx.restore();
            }

            // Draw embers on separate canvas
            emberCtx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);
            emberParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy -= 0.015;
                p.life -= p.decay;
                if (p.life > 0) {
                    emberCtx.beginPath();
                    emberCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    emberCtx.fillStyle = `rgba(255, ${Math.round(80 * p.life)}, ${Math.round(20 * p.life)}, ${p.life})`;
                    emberCtx.fill();
                }
            });
            emberParticles = emberParticles.filter(p => p.life > 0);

            if (burnRadius < maxRadius) {
                requestAnimationFrame(animateBurn);
            } else {
                // Fade remaining embers then clean up
                function fadeEmbers() {
                    emberCtx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);
                    let alive = false;
                    emberParticles.forEach(p => {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy -= 0.015;
                        p.life -= p.decay;
                        if (p.life > 0) {
                            alive = true;
                            emberCtx.beginPath();
                            emberCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                            emberCtx.fillStyle = `rgba(255, ${Math.round(80 * p.life)}, ${Math.round(20 * p.life)}, ${p.life})`;
                            emberCtx.fill();
                        }
                    });
                    if (alive) {
                        requestAnimationFrame(fadeEmbers);
                    } else {
                        loadScreen.remove();
                        emberCanvas.remove();
                        burnOverlay.remove();
                    }
                }
                fadeEmbers();
            }
        }

        animateBurn();
    }

    // Trigger: burn when page is loaded (no minimum delay)
    window.addEventListener('load', () => {
        readyToBurn = true;
    });
})();

