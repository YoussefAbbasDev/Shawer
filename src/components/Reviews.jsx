import React from 'react';

const reviewsData = [
  {
    name: 'سارة المنصوري',
    role: 'معلمة دمج وتخاطب',
    img: '/imgs/avatars/user1.jpg',
    text: 'منصة شاور سهلت عملي مع الأطفال وضعاف السمع بشكل ملحوظ. أستطيع الآن كتابة أي قصة أو تدريب وتحويله لفيديو إشارة في ثوانٍ معدودة. خطوة رائدة فعلاً!'
  },
  {
    name: 'عمر عبد الرحمن',
    role: 'مهندس برمجيات',
    img: '/imgs/avatars/user2.jpg',
    text: 'السرعة الفائقة وانعدام أي تأخير في تشغيل الإشارات المتتابعة جعل التجربة ممتعة جداً. دقة لغة الإشارة وترتيب الحروف استثنائي.'
  },
  {
    name: 'منى سعيد',
    role: 'أم لطفل أصم',
    img: '/imgs/avatars/user3.jpg',
    text: 'شاور ساعدتنا في البيت على التواصل مع ابننا وتعلم لغة الإشارة معه بمتعة وبساطة. زر الإملاء الصوتي وفّر علينا ساعات طويلة من البحث.'
  },
  {
    name: 'د. طارق الشريف',
    role: 'باحث في التكنولوجيا المساعدة',
    img: '/imgs/avatars/user4.jpg',
    text: 'مبادرة نوعية تخدم التحول الرقمي الشامل وتطبيق معايير الإتاحة وسهولة الوصول لذوي الإعاقة السمعية في العالم العربي. كل التقدير لهذا العمل المتميز.'
  }
];

export default function Reviews() {
  return (
    <section className="reviews-section" id="reviews">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">مجتمع شاور</span>
          <h2 className="section-title">ماذا يقول <span>مستخدمونا</span> عن المنصة؟</h2>
          <p className="section-desc">آراء وتجارب حقيقية من معلمين، أولياء أمور، ومتخصصين في دعم ذوي الهمم.</p>
        </div>

        <div className="reviews-grid">
          {reviewsData.map((review, idx) => (
            <div className="review-card" key={idx}>
              <div className="review-header">
                <img src={review.img} alt={review.name} className="reviewer-img" />
                <div className="reviewer-info">
                  <h4>{review.name}</h4>
                  <span>{review.role}</span>
                  <div className="review-stars">★★★★★</div>
                </div>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
