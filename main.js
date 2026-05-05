/* ═══════════════════════════════════════════════════════════
   RICHMONDHILL GLOSS & DETAIL — main.js
   ═══════════════════════════════════════════════════════════ */

console.log("Richmondhill Gloss & Detail — Site Ready.");

// ─────────────────────────────────────────────────────────
// HAMBURGER MENU
// ─────────────────────────────────────────────────────────

let _scrollY = 0;

function lockScroll() {
    _scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_scrollY}px`;
    document.body.style.width = '100%';
}

function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, _scrollY);
}

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-fixed');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            isOpen ? lockScroll() : unlockScroll();
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', false);
                unlockScroll();
            });
        });
    }
});

// ─────────────────────────────────────────────────────────
// SMOOTH SCROLL HELPER
// ─────────────────────────────────────────────────────────

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 76; // header height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
}

// ─────────────────────────────────────────────────────────
// DOM READY
// ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

    /* ── 1. Header — transparent → solid on scroll ───── */
    const header = document.getElementById('site-header');
    if (header) {
        const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on load
    }

    /* ── 3. Active nav link ──────────────────────────── */
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active-link');
        const href = a.getAttribute('href') || '';
        if (href === page) {
            a.classList.add('active-link');
        }
    });

    /* ── 4. Scroll Reveal (IntersectionObserver) ─────── */
    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el, i) => {
        // Stagger sibling reveals in the same parent
        el.style.transitionDelay = `${(i % 4) * 0.08}s`;
        revealObserver.observe(el);
    });

    /* ── 5. Hero Parallax ────────────────────────────── */
    const heroBg = document.getElementById('heroBg');
    if (heroBg) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ── 6. Before / After Sliders ───────────────────── */
    document.querySelectorAll('.image-comparison').forEach(container => {
        const beforeImg = container.querySelector('.img-before');
        const sliderEl  = container.querySelector('.comparison-slider');
        const line      = container.querySelector('.slider-line');
        if (!beforeImg || !sliderEl) return;

        function moveTo(clientX) {
            const rect = container.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.min(Math.max(pct, 2), 98);
            beforeImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
            if (line) line.style.left = `${pct}%`;
        }

        // Range input (accessible)
        sliderEl.addEventListener('input', function () {
            const rect = container.getBoundingClientRect();
            moveTo(rect.left + (this.value / 100) * rect.width);
        });

        // Mouse drag
        let dragging = false;
        container.addEventListener('mousedown', e => { dragging = true; moveTo(e.clientX); });
        window.addEventListener('mouseup',   () => { dragging = false; });
        window.addEventListener('mousemove', e => { if (dragging) moveTo(e.clientX); });

        // Touch drag
        container.addEventListener('touchmove', e => {
            e.preventDefault();
            moveTo(e.touches[0].clientX);
        }, { passive: false });
    });

    /* ── 7. Smooth anchor clicks (internal nav links) ── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                scrollToSection(id);
            }
        });
    });

    /* ── 8. AJAX Form Submission ─────────────────────── */
    document.querySelectorAll('.custom-contact-form').forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            if (!btn) return;
            const originalHTML = btn.innerHTML;

            // Loading state
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="spin">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="2.2"
                            stroke-linecap="round" stroke-dasharray="34" stroke-dashoffset="10"/>
                </svg>
                SENDING…
            `;
            btn.disabled = true;
            btn.style.opacity = '0.75';

            try {
                const res = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    // ✅ Success
                    form.innerHTML = `
                        <div style="
                            text-align:center;
                            padding:60px 20px;
                        ">
                            <div style="
                                width:64px;height:64px;
                                border:2px solid #c8a96e;
                                border-radius:50%;
                                display:flex;align-items:center;justify-content:center;
                                margin:0 auto 28px;
                            ">
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                    <path d="M5 14l7 7 11-11"
                                          stroke="#c8a96e" stroke-width="2.5"
                                          stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <p style="
                                font-family:'Bebas Neue',sans-serif;
                                font-size:36px;letter-spacing:3px;
                                color:#f0ece4;margin:0 0 14px;
                            ">SESSION REQUESTED</p>
                            <p style="
                                font-family:'Jost',sans-serif;
                                font-size:14px;font-weight:300;
                                color:#6b6762;line-height:1.8;
                                max-width:360px;margin:0 auto;
                            ">We'll confirm your booking within 2 hours. Check your email or phone for details.</p>
                        </div>
                    `;
                } else {
                    btn.innerHTML  = originalHTML;
                    btn.disabled   = false;
                    btn.style.opacity = '1';
                    showFormError(form, 'Something went wrong. Please try again or call us at 647-395-7905.');
                }
            } catch {
                btn.innerHTML  = originalHTML;
                btn.disabled   = false;
                btn.style.opacity = '1';
                showFormError(form, 'Network error. Please check your connection or call 647-395-7905.');
            }
        });
    });

});

// ─────────────────────────────────────────────────────────
// HELPER: inline error message
// ─────────────────────────────────────────────────────────

function showFormError(form, message) {
    const old = form.querySelector('.form-error');
    if (old) old.remove();
    const div = document.createElement('div');
    div.className = 'form-error';
    div.style.cssText = `
        background: rgba(220,38,38,0.1);
        border: 1px solid rgba(220,38,38,0.3);
        color: #fca5a5;
        padding: 12px 16px;
        border-radius: 3px;
        font-size: 13px;
        margin-bottom: 16px;
        font-family: 'Jost', sans-serif;
        font-weight: 400;
        text-align: center;
    `;
    div.textContent = message;
    form.insertBefore(div, form.firstChild);
    setTimeout(() => div.remove(), 7000);
}