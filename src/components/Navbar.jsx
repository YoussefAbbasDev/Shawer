import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="header-wrapper">
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <a href="#home" className="logo" onClick={() => setMenuOpen(false)}>
          <img src="/imgs/logo.png" alt="شعار شاور" />
          <span className="logo-text">شاور</span>
        </a>

        <nav>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#home" onClick={() => setMenuOpen(false)}>الرئيسية</a></li>
            <li><a href="#translate" onClick={() => setMenuOpen(false)}>مترجم الإشارة</a></li>
            <li><a href="#why-shawer" onClick={() => setMenuOpen(false)}>لماذا شاور</a></li>
            <li><a href="#about" onClick={() => setMenuOpen(false)}>عن شاور</a></li>
            <li><a href="#reviews" onClick={() => setMenuOpen(false)}>آراء المستخدمين</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>تواصل معنا</a></li>
          </ul>
        </nav>

        <div className="nav-actions">
          <a href="#translate" className="nav-cta" onClick={() => setMenuOpen(false)}>
            <span>ابدأ الآن</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </a>
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* خلفية معتمة لإغلاق القائمة عند النقر خارجها في الموبايل */}
      {menuOpen && (
        <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
