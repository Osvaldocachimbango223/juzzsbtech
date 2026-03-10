// Juzzs Travel & Hospitality - Global Script

// ── Mobile menu ──────────────────────────────────────────────
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    if (!navLinks) return;
    navLinks.classList.toggle('active');
    menuToggle && menuToggle.classList.toggle('open');
}

// Close menu when a nav link is clicked
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks && navLinks.classList.remove('active');
            const menuToggle = document.querySelector('.menu-toggle');
            menuToggle && menuToggle.classList.remove('open');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
});

// ── Helper: generate ID ───────────────────────────────────────
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ── Simple password hashing (obfuscation for client-side) ─────
function hashPassword(password) {
    // SHA-256 via Web Crypto API — async wrapper used in auth forms
    return password; // fallback; real hash done async in forms
}

async function hashPasswordAsync(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
