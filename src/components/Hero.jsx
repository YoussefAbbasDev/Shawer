import React from 'react';

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span>✨</span>
              <span>المنصة الذكية الأولى للغة الإشارة العربية</span>
            </div>

            <h1 className="hero-title">
              شاور .. <span>لنتحاور</span>
            </h1>

            <p className="hero-subtitle">
              <strong>شاور</strong> هي منصة ذكية تُحوّل أي نص عربي مكتوب إلى فيديو بلغة الإشارة بضغطة زر واحدة بسرعة 1.5x الفورية. تواصل مع الجميع بسهولة ويسر.. هيا لنكسر حاجز الصمت!
            </p>

            <div className="hero-buttons">
              <a href="#translate" className="btn-primary">
                <span>ابدأ الترجمة الآن</span>
              </a>

              <a href="#why-shawer" className="btn-video">
                <div className="play-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span>اعرف أكثر عن شاور</span>
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h4>145+</h4>
                <p>كلمة وحرف مسجل</p>
              </div>
              <div className="stat-item">
                <h4>1.5x</h4>
                <p>سرعة تشغيل تلقائية</p>
              </div>
              <div className="stat-item">
                <h4>0.0 ث</h4>
                <p>استجابة فورية بدون انتظار</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
