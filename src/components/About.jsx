import React from 'react';

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">
            <img 
              src="/imgs/about-illustration.svg" 
              alt="عن منصة شاور للتواصل بلغة الإشارة" 
              onError={(e) => {
                // في حال وجود أي مشكلة في تحميل المسار، استخدام مسار الـ svg البديل
                e.currentTarget.src = '/imgs/IMG_20250107_233140_019.svg';
              }}
            />
            <div className="about-badge-float">
              <span className="icon">🤝</span>
              <div>
                <h5>مجتمع عربي متكافل</h5>
                <p>تمكين أكثر من 11 مليون بطل في الوطن العربي</p>
              </div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-tag">رسالتنا ورؤيتنا</span>
            <h2>نبتكر لنبني <span>جسور الأمل</span> ونجعل التواصل حقاً إنسانياً شاملاً</h2>
            
            <p>
              انطلقت منصة <strong>شاور</strong> من إيمان راسخ بأن لغة الإشارة ليست مجرد إيماءات، بل هي لغة حية وهوية وثقافة أصيلة لملايين الصم وضعاف السمع في مجتمعاتنا العربية.
            </p>
            <p>
              نطمح إلى إزالة كافة حواجز العزلة عبر دمج التقنيات الحديثة في خدمة الإنسان؛ حيث نحول الكلمات والنصوص اليومية إلى مشاهد مرئية تفاعلية دقيقة وموثوقة، تسهم في تعزيز الدمج التعليمي والمهني والمجتمعي بكل احترام وتقدير.
            </p>

            <div className="about-points">
              <div className="point-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                <span>تمكين ودمج حقيقي للصم في المجتمع</span>
              </div>
              <div className="point-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                <span>قاموس إشاري عربي موثق ودقيق</span>
              </div>
              <div className="point-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                <span>تواصل تفاعلي فوري بالصوت والنص</span>
              </div>
              <div className="point-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                <span>بيئة رقمية ميسرة وسهلة الوصول للجميع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
