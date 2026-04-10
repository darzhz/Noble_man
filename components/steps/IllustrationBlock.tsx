import React from 'react';
import './illustration.css';

interface IllustrationBlockProps {
  onBuyDigital?: () => void;
  onBuyCanvas?: () => void;
}

export default function IllustrationBlock({ onBuyDigital, onBuyCanvas }: IllustrationBlockProps) {
  return (
    <div className="nob-block bg-background">
      <p className="section-eyebrow">See the difference</p>
      <h2 className="section-headline">Don't Just Save It. Immortalize It.</h2>
      <p className="section-sub">Pixels are temporary. Oil paint lasts centuries.</p>

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
          <span className="img-badge badge-digital">AI preview</span>
          <div className="panel-label">
            <div className="panel-title">Digital download</div>
            <div className="panel-sub">Instant &middot; watermark-free</div>
            <button onClick={onBuyDigital} className="price-pill price-left hover:scale-105 transition-transform cursor-pointer">$20</button>
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
          <span className="img-badge badge-painted">Real Oil Paint</span>
          <div className="panel-label">
            <div className="panel-title">Master Canvas</div>
            <div className="panel-sub">100% Hand-painted art</div>
            <button onClick={onBuyCanvas} className="price-pill price-right hover:scale-105 transition-transform cursor-pointer">From $299</button>
          </div>
        </div>
      </div>

      <div className="proof-strip">
        <div className="proof-stat">✓ Museum-grade materials</div>
        <div className="proof-text">Real artists. Real canvas. Ships ready to hang.</div>
      </div>

      <hr className="section-divider" />

      {/* CELEBRITY STRIP */}
      <p className="celeb-eyebrow">A few familiar faces</p>
      <h2 className="celeb-headline">We've Painted Some People You Might Recognize.</h2>
      <p className="celeb-sub">Over 10,000 portraits and counting — including a few celebrities
        who commissioned us to immortalize them in style.</p>

      <div className="celeb-img-wrap">
        <img src="/royal1.jpeg" alt="Celebrity holding their Nobilified portrait" />
      </div>
      <p className="celeb-caption">"The Backstreet Boys. All five. Each one a hand-painted oil masterpiece."</p>

    </div>
  );
}
