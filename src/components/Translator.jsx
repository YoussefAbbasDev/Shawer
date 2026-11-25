import React, { useState, useRef, useEffect } from 'react';
import { textToSignSequence } from '../data/dictionary.js';

export default function Translator({ onNotify }) {
  const [text, setText] = useState('أنا حب الجميع');
  const [speed, setSpeed] = useState(1.5); // السرعة الافتراضية 1.5x
  const [isListening, setIsListening] = useState(false);

  // حالات المحرك الهجين (دمج سيرفر + تشغيل فوري كلاينت على Vercel)
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mergedUrl, setMergedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mergeDuration, setMergeDuration] = useState(null);

  // حالات مشغل الفيديو الاحترافي
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const mergeStartRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

  // تحديث سرعة الفيديو عند تغيرها أو الانتقال بين المقاطع
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, mergedUrl, currentIndex]);

  // إخفاء شريط التحكم تلقائياً بعد فترة أثناء التشغيل
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying && !isEnded) {
      hideControlsTimerRef.current = setTimeout(() => {
        if (!isSpeedMenuOpen) setShowControls(false);
      }, 3000);
    }
  };

  // إغلاق قائمة السرعة عند النقر خارجها
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.speed-dropdown-wrapper')) {
        setIsSpeedMenuOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // دالة تحويل النص
  const handleConvert = async (textInput = text) => {
    const raw = (textInput || '').trim();
    if (!raw) {
      onNotify('يرجى كتابة نص عربي أولاً للترجمة!', true);
      return;
    }

    const seq = textToSignSequence(raw);
    if (!seq || seq.length === 0) {
      onNotify('لم يتم العثور على أي إشارات مطابقة للنص. جرب كلمات أو حروف أخرى.', true);
      return;
    }

    setLoading(true);
    setMergedUrl(null);
    setSequence(seq);
    setCurrentIndex(0);
    setMergeDuration(null);
    setIsEnded(false);
    setIsPlaying(false);
    mergeStartRef.current = Date.now();

    // 1. محاولة طلب الدمج من سيرفر الـ Backend إن وُجد
    const clips = seq.map((item) => `${item.token}.mp4`);
    let serverSuccess = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // مهلة سريعة حتى لا يعلق المتصفح

      const res = await fetch('/api/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clips }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const elapsed = ((Date.now() - mergeStartRef.current) / 1000).toFixed(2);
        setMergedUrl(url);
        setMergeDuration(elapsed);
        serverSuccess = true;
        onNotify(`✅ تم تجهيز الفيديو المدمج (${seq.length} إشارة) في ${elapsed} ثانية!`);
      }
    } catch {
      serverSuccess = false;
    }

    // 2. Fallback تلقائي وفوري للكلاينت (يعمل 100% على Vercel وأي استضافة ثابتة وبدون أخطاء 404)
    if (!serverSuccess) {
      setMergedUrl(null);
      setMergeDuration('0.0');
      setIsEnded(false);
      setIsPlaying(true);
      onNotify(`✨ تم تجهيز ${seq.length} إشارة وتشغيلها بسرعة ${speed}x فوراً!`);
    }

    setLoading(false);
  };

  // تشغيل / إيقاف مؤقت
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isEnded) {
      handleReplay();
      return;
    }
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  // إعادة التشغيل من البداية
  const handleReplay = () => {
    if (videoRef.current) {
      if (mergedUrl) {
        videoRef.current.currentTime = 0;
      } else {
        setCurrentIndex(0);
        videoRef.current.currentTime = 0;
      }
      videoRef.current.playbackRate = speed;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setIsEnded(false);
      }).catch(() => {});
    }
  };

  // عند انتهاء مقطع الفيديو
  const handleVideoEnded = () => {
    if (mergedUrl) {
      setIsPlaying(false);
      setIsEnded(true);
      setShowControls(true);
    } else {
      // تشغيل المقطع التالي في التسلسل
      if (currentIndex < sequence.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        setIsEnded(true);
        setShowControls(true);
      }
    }
  };

  // تقديم وتأخير عبر شريط التقدم
  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      if (mergedUrl) {
        videoRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
      } else if (sequence.length > 0) {
        // حساب المقطع المقابل للموقع المطلوب
        const targetIndex = Math.min(
          Math.floor((seekTime / (duration || 1)) * sequence.length),
          sequence.length - 1
        );
        setCurrentIndex(targetIndex);
      }
      if (isEnded) {
        setIsEnded(false);
      }
    }
  };

  // تغيير السرعة
  const handleSpeedSelect = (s) => {
    setSpeed(s);
    if (videoRef.current) {
      videoRef.current.playbackRate = s;
    }
    setIsSpeedMenuOpen(false);
    onNotify(`⚡ تم ضبط سرعة العرض إلى ${s}x`);
  };

  // ملء الشاشة
  const toggleFullscreen = () => {
    const el = playerContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // تنسيق الوقت
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // الإملاء الصوتي
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onNotify('متصفحك لا يدعم ميزة الإملاء الصوتي المباشر.', true);
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      onNotify('🎤 جاري الاستماع إلى صوتك...');
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText((prev) => (prev ? prev + ' ' : '') + transcript);
      onNotify(`🎤 تم التقاط: "${transcript}"`);
    };
    recognition.onerror = () => {
      setIsListening(false);
      onNotify('تعذر التعرف على الصوت أو تم رفض إذن الميكروفون.', true);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSample = (sample) => {
    setText(sample);
    handleConvert(sample);
  };

  // تحديد مسار الفيديو الحالي
  const activeVideoSrc = mergedUrl || (sequence[currentIndex] ? sequence[currentIndex].video : null);
  const activeProgress = mergedUrl
    ? duration > 0 ? (currentTime / duration) * 100 : 0
    : sequence.length > 0 ? ((currentIndex + 1) / sequence.length) * 100 : 0;

  return (
    <section className="translator-section" id="translate">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">المترجم الفوري التفاعلي</span>
          <h2 className="section-title">
            أكتب النص بالعربي وشاهد سحر <span>شاور !!</span> في تحويله إلى فيديو بلغة الإشارة
          </h2>
          <p className="section-desc">
            أدخل أي عبارة عربية أو تحدث بالصوت، وسيقوم النظام بتشغيل إشارات الكلمات والحروف بدقة وسلاسة فائقة.
          </p>
        </div>

        <div className="translator-grid">
          {/* بطاقة إدخال النص */}
          <div className="input-card">
            <div className="input-header">
              <h3>
                <span>✍️</span>
                <span>إدخال النص العربي</span>
              </h3>
              <span className="badge-live">معالجة فورية</span>
            </div>

            <div className="textarea-wrapper">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب النص هنا... مثلاً: أنا حب الجميع، إلى اللقاء، أراك غداً..."
              />
              <div className="textarea-tools">
                <div className="tool-buttons">
                  <button
                    type="button"
                    className={`tool-btn ${isListening ? 'active' : ''}`}
                    onClick={toggleVoice}
                  >
                    <span>🎤</span>
                    <span>{isListening ? 'جاري الاستماع...' : 'تحدث بالصوت'}</span>
                  </button>
                  <button type="button" className="tool-btn" onClick={() => setText('')}>
                    <span>🗑️</span>
                    <span>مسح</span>
                  </button>
                </div>
                <div>
                  <span>{text.length}</span> حرف | <span>{text.trim() ? text.trim().split(/\s+/).length : 0}</span> كلمة
                </div>
              </div>
            </div>

            {/* عبارات سريعة */}
            <div className="quick-prompts">
              <p>💡 عبارات سريعة للتجربة بضغطة زر:</p>
              <div className="prompt-chips">
                {['أنا حب الجميع', 'إلى اللقاء', 'أراك غداً', 'جميل', 'الساعة التاسعة', 'شكراً', 'أسبوع سعيد'].map((sample) => (
                  <span key={sample} className="chip" onClick={() => handleSample(sample)}>
                    {sample}
                  </span>
                ))}
              </div>
            </div>

            {/* زر التحويل */}
            <button
              type="button"
              className="btn-convert"
              onClick={() => handleConvert()}
              disabled={loading}
            >
              <span>{loading ? 'جاري التجهيز...' : 'حول النص الآن'}</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
              </svg>
            </button>
          </div>

          {/* بطاقة مشغل الفيديو العصرية */}
          <div className="video-card">
            <div className="video-header">
              <h3>
                <span>🤟</span>
                <span>مشغل لغة الإشارة</span>
              </h3>
            </div>

            {/* حاوية المشغل الفعلي */}
            <div
              className="player-container"
              ref={playerContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && !isEnded && !isSpeedMenuOpen && setShowControls(false)}
            >
              {loading ? (
                <div className="video-placeholder">
                  <div className="placeholder-icon spinner-icon">⏳</div>
                  <h4>جاري معالجة الإشارات...</h4>
                  <p>يتم تجهيز المقاطع بأعلى دقة، لحظات قليلة</p>
                </div>
              ) : !activeVideoSrc ? (
                <div className="video-placeholder">
                  <div className="placeholder-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  </div>
                  <h4>فيديو لغة الإشارة سيظهر هنا</h4>
                  <p>أدخل نصك واضغط "حول النص الآن" لمشاهدة الترجمة فورياً</p>
                </div>
              ) : (
                <div className="video-viewport">
                  <video
                    ref={videoRef}
                    key={activeVideoSrc}
                    src={activeVideoSrc}
                    playsInline
                    autoPlay
                    onClick={togglePlay}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.playbackRate = speed;
                        setDuration(videoRef.current.duration || 0);
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                      }
                    }}
                    onPlay={() => {
                      setIsPlaying(true);
                      setIsEnded(false);
                    }}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleVideoEnded}
                  >
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>

                  {/* زر التشغيل الكبير في المنتصف عند الإيقاف المؤقت */}
                  {!isPlaying && !isEnded && (
                    <div className="center-play-overlay" onClick={togglePlay}>
                      <button type="button" className="center-play-btn" title="تشغيل">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* زر إعادة التشغيل البسيط كـ Overlay في المنتصف عند انتهاء الفيديو */}
                  {isEnded && (
                    <div className="center-replay-overlay" onClick={handleReplay}>
                      <button
                        type="button"
                        className="center-replay-btn"
                        onClick={handleReplay}
                        title="إعادة التشغيل من البداية"
                      >
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* شريط التحكم السفلي المدمج والمطور داخل المشغل */}
                  <div className={`custom-video-controls ${showControls || !isPlaying || isEnded ? 'visible' : ''}`}>
                    {/* شريط التقدم السلس LTR */}
                    <div className="progress-container" dir="ltr">
                      <input
                        dir="ltr"
                        type="range"
                        min="0"
                        max={duration || 1}
                        step="0.02"
                        value={currentTime}
                        onChange={handleSeek}
                        className="progress-slider"
                        style={{
                          background: `linear-gradient(to right, #eb510f 0%, #eb510f ${activeProgress}%, rgba(255,255,255,0.25) ${activeProgress}%, rgba(255,255,255,0.25) 100%)`
                        }}
                      />
                    </div>

                    <div className="controls-row">
                      {/* الجانب الأيمن (التشغيل والوقت) */}
                      <div className="controls-group">
                        <button
                          type="button"
                          className="ctrl-btn"
                          onClick={togglePlay}
                          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                        >
                          {isPlaying ? (
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>

                        <button
                          type="button"
                          className="ctrl-btn"
                          onClick={handleReplay}
                          title="إعادة التشغيل من البداية"
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                          </svg>
                        </button>

                        <span className="ctrl-time">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* الجانب الأيسر (السرعة وملء الشاشة) */}
                      <div className="controls-group">
                        {/* قائمة إعدادات السرعة المنبثقة داخل المشغل */}
                        <div className="speed-dropdown-wrapper">
                          <button
                            type="button"
                            className="ctrl-btn speed-toggle-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSpeedMenuOpen(!isSpeedMenuOpen);
                            }}
                            title="إعدادات سرعة التشغيل"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                            <span>{speed}x</span>
                          </button>

                          {isSpeedMenuOpen && (
                            <div className="speed-menu" onClick={(e) => e.stopPropagation()}>
                              <div className="speed-menu-header">
                                <span>⚡ سرعة العرض</span>
                              </div>
                              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className={`speed-option ${speed === s ? 'active' : ''}`}
                                  onClick={() => handleSpeedSelect(s)}
                                >
                                  <span>{s}x {s === 1.5 ? '(افتراضي)' : ''}</span>
                                  {speed === s && <span className="check">✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* زر ملء الشاشة */}
                        <button
                          type="button"
                          className="ctrl-btn"
                          onClick={toggleFullscreen}
                          title="ملء الشاشة"
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* شريط الإشارات الفعالة (Chips) */}
            {sequence.length > 0 && (
              <div className="sequence-box">
                <div className="sequence-header">
                  <span>الإشارات المتتابعة:</span>
                  <span>{sequence.length} مقطع</span>
                </div>
                <div className="sequence-tokens">
                  {sequence.map((item, idx) => (
                    <div
                      key={idx}
                      className={`token-pill ${!mergedUrl && idx === currentIndex ? 'active' : ''}`}
                      onClick={() => {
                        if (!mergedUrl) {
                          setCurrentIndex(idx);
                        }
                      }}
                      title={`تشغيل إشارة: ${item.token}`}
                      style={{ cursor: !mergedUrl ? 'pointer' : 'default' }}
                    >
                      <span>{item.token}</span>
                      <span className="pill-type">{item.type === 'word' ? 'كلمة' : 'حرف'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
