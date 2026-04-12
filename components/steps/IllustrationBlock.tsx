'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import './illustration.css';

interface IllustrationBlockProps {
  onBuyDigital?: () => void;
  onBuyCanvas?: () => void;
}

export default function IllustrationBlock({ onBuyDigital, onBuyCanvas }: IllustrationBlockProps) {
  const { t } = useTranslation();

  return (
    <div className="nob-block bg-background">
      <p className="section-eyebrow">{t('illustration_eyebrow')}</p>
      <h2 className="section-headline">{t('illustration_headline')}</h2>
      <p className="section-sub">{t('illustration_sub')}</p>

      <div className="vs-row">
        {/* Left: Digital */}
        <div className="nob-panel">
          <div className="frame-outer frame-left">
            <div className="canvas-wrap">
              <img src="/unroyal.jpeg" alt="AI digital preview" />
              <div className="watermark-layer">
                <span className="wm" style={{ top: '14%', left: '-8%' }}>nobilified</span>
                <span className="wm" style={{ top: '34%', left: '18%' }}>nobilified</span>
                <span className="wm" style={{ top: '54%', left: '-6%' }}>nobilified</span>
                <span className="wm" style={{ top: '72%', left: '22%' }}>nobilified</span>
                <span className="wm" style={{ top: '6%', left: '38%' }}>nobilified</span>
                <span className="wm" style={{ top: '46%', left: '42%' }}>nobilified</span>
              </div>
            </div>
          </div>
          <span className="img-badge badge-digital">{t('illustration_badge_digital')}</span>
          <div className="panel-label">
            <div className="panel-title">{t('illustration_digital_title')}</div>
            <div className="panel-sub">{t('illustration_digital_sub')}</div>
            <button onClick={onBuyDigital} className="price-pill price-left hover:scale-105 transition-transform cursor-pointer">{t('preview_digital_price')}</button>
          </div>
        </div>

        <div className="vs-mid"><span className="vs-text">vs</span></div>

        {/* Right: Hand-painted */}
        <div className="nob-panel">
          <div className="frame-outer frame-right">
            <div className="canvas-wrap">
              <img src="/royal2.jpeg" alt="Hand-painted oil canvas" />
            </div>
          </div>
          <span className="img-badge badge-painted">{t('illustration_badge_painted')}</span>
          <div className="panel-label">
            <div className="panel-title">{t('illustration_canvas_title')}</div>
            <div className="panel-sub">{t('illustration_canvas_sub')}</div>
            <button onClick={onBuyCanvas} className="price-pill price-right hover:scale-105 transition-transform cursor-pointer">{t('preview_canvas_price')}</button>
          </div>
        </div>
      </div>

      <div className="proof-strip">
        <div className="proof-stat">{t('illustration_proof_stat')}</div>
        <div className="proof-text">{t('illustration_proof_text')}</div>
      </div>

      <hr className="section-divider" />

      {/* CELEBRITY STRIP */}
      <p className="celeb-eyebrow">{t('illustration_celeb_eyebrow')}</p>
      <h2 className="celeb-headline">{t('illustration_celeb_headline')}</h2>
      <p className="celeb-sub">{t('illustration_celeb_sub')}</p>

      <div className="celeb-img-wrap">
        <img src="/royal1.jpeg" alt="Celebrity holding their Nobilified portrait" />
      </div>
      <p className="celeb-caption">{t('illustration_celeb_caption')}</p>

    </div>
  );
}
