/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

const services = [
  { number: '01', description: 'лендинги, логотипы,\nбаннеры, соцсети' },
  { number: '02', description: '3D анимации, модели,\nгеймдев' },
  { number: '03', description: 'приложения, сайты,\nботы' },
];

const experienceVideoUrl =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_135039_b04d00db-6ee2-4e2a-a7f5-b2dfd3d24fd2.mp4';

const archiveCards = [
  {
    title: 'APEX CORE · AI',
    date: '04.08.26',
    href: 'https://apex-core.site',
    imageSrc: '/apex.png',
  },
  {
    title: 'VERDE · CRYPTOWALLET',
    date: '05.03.26',
    href: 'https://T.ME/VerdeWalletBot/app',
    imageSrc: '/verde.png',
  },
  {
    title: 'PICTOR · AI',
    date: '05.07.26',
    href: 'https://pictorai-zeta.vercel.app/',
    imageSrc: '/pictor.png',
  },
  {
    title: 'AURA · SOUND',
    date: '06.11.25',
    href: 'https://aura-sound-smoky.vercel.app/',
    imageSrc: '/aura.png',
  },
];

function ArchiveCard({
  title,
  date,
  href,
  imageSrc,
  index,
  isVisible,
}: {
  title: string;
  date: string;
  href: string;
  imageSrc: string;
  index: number;
  isVisible: boolean;
}) {
  return (
    <a
      className={`archive-card archive-card-${index + 1}${isVisible ? ' is-visible' : ''}`}
      style={{ '--card-order': index } as React.CSSProperties}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title}, ${date}`}
    >
      {imageSrc ? (
        <img className="archive-art-image" src={imageSrc} alt="" />
      ) : (
        <div className="archive-art" aria-hidden="true">
          <div className="archive-art-disc">
            <div className="archive-art-center">
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="9" y="10" width="30" height="27" rx="6" />
                <circle cx="18" cy="19" r="3.5" />
                <path d="M11 32l8-8 6 5 6-7 6 5" />
              </svg>
            </div>
          </div>
        </div>
      )}
      <div className="archive-card-caption">
        <span>{title}</span>
        <time>{date}</time>
      </div>
    </a>
  );
}

function ServiceNumber({ number }: { number: string }) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = numberRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let active = true;
    let frame = 0;
    const drawNumber = () => {
      if (!active) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.ceil(rect.width * scale);
      const height = Math.ceil(rect.height * scale);
      canvas.width = width;
      canvas.height = height;

      const mask = document.createElement('canvas');
      mask.width = width;
      mask.height = height;
      const maskContext = mask.getContext('2d', { willReadFrequently: true });
      const context = canvas.getContext('2d');
      if (!maskContext || !context) return;

      const style = getComputedStyle(container);
      const fontSize = parseFloat(style.fontSize);
      const font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      maskContext.scale(scale, scale);
      maskContext.font = font;
      maskContext.textBaseline = 'alphabetic';
      maskContext.fillStyle = '#fff';

      const metrics = maskContext.measureText(number);
      const ascent = metrics.actualBoundingBoxAscent;
      const descent = metrics.actualBoundingBoxDescent;
      const baseline = (rect.height - ascent - descent) / 2 + ascent;
      maskContext.fillText(number, 0, baseline);
      const pixels = maskContext.getImageData(0, 0, width, height).data;

      context.clearRect(0, 0, width, height);
      context.fillStyle = '#fff';
      const radius = Math.max(1, fontSize * 0.0065 * scale);
      const spacing = Math.max(4, fontSize * 0.024 * scale);
      const edgeSamples = 24;

      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          let fullyInside = true;
          for (let i = 0; i < edgeSamples; i += 1) {
            const angle = (i / edgeSamples) * Math.PI * 2;
            const sampleX = Math.round(x + Math.cos(angle) * radius);
            const sampleY = Math.round(y + Math.sin(angle) * radius);
            if (
              sampleX < 0 ||
              sampleY < 0 ||
              sampleX >= width ||
              sampleY >= height ||
              pixels[(sampleY * width + sampleX) * 4 + 3] < 160
            ) {
              fullyInside = false;
              break;
            }
          }

          if (fullyInside) {
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
          }
        }
      }

    };

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(drawNumber);
    });
    resizeObserver.observe(container);
    void document.fonts.ready.then(() => {
      if (active) drawNumber();
    });
    drawNumber();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [number]);

  return (
    <span ref={numberRef} className="service-number" aria-hidden="true">
      <canvas ref={canvasRef} className="service-number-dots" aria-hidden="true" />
    </span>
  );
}

function ServiceItem({
  number,
  description,
  index,
  isVisible,
}: {
  number: string;
  description: string;
  index: number;
  isVisible: boolean;
}) {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedText(description);
      setIsTyping(false);
      return;
    }

    setTypedText('');
    setIsTyping(false);
    let characterIndex = 0;
    let typeTimer = 0;
    const sequenceDelay = services
      .slice(0, index)
      .reduce(
        (delay, service) => delay + service.description.length * 34 + 350,
        600,
      );
    const startTimer = window.setTimeout(() => {
        setIsTyping(true);
        const typeNextCharacter = () => {
          characterIndex += 1;
          setTypedText(description.slice(0, characterIndex));
          if (characterIndex < description.length) {
            typeTimer = window.setTimeout(typeNextCharacter, 34);
          } else {
            setIsTyping(false);
          }
        };
      typeNextCharacter();
    }, sequenceDelay);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(typeTimer);
    };
  }, [description, index, isVisible]);

  return (
    <article
      className={`service-item${isVisible ? ' is-visible' : ''}`}
      style={{ '--item-order': index } as React.CSSProperties}
      aria-label={`${number}: ${description.replace('\n', ' ')}`}
    >
      <ServiceNumber number={number} />
      <p className="service-description" aria-hidden="true">
        <span className="service-description-ghost">{description}</span>
        <span className="service-description-typed">
          {typedText}
          {isTyping && <span className="service-caret" />}
        </span>
      </p>
    </article>
  );
}

export default function App() {
  const servicesRef = useRef<HTMLElement>(null);
  const [servicesVisible, setServicesVisible] = useState(false);
  const archiveRef = useRef<HTMLElement>(null);
  const [archiveVisible, setArchiveVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const experienceVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = servicesRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setServicesVisible(true);
        observer.disconnect();
      },
      { threshold: 0.1 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = archiveRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setArchiveVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = experienceVideoRef.current;
    const section = video?.closest<HTMLElement>('.experience-section');
    if (!video || !section) return;

    const startLoading = () => {
      video.src = experienceVideoUrl;
      video.load();
    };

    if (!('IntersectionObserver' in window)) {
      startLoading();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startLoading();
        observer.disconnect();
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (window.location.pathname === '/blender') {
    return <BlenderPage />;
  }

  return (
    <>
      <section
        id="top"
        className="relative h-screen w-full overflow-hidden bg-black select-none"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4"
        />

        <nav
          aria-label="Основная навигация"
          className="site-nav absolute z-20 px-6 md:px-10 pt-6 top-0 left-0 right-0 flex items-center justify-between gap-4"
        >
          <a
            href="#top"
            className="px-6 py-3 text-white text-sm font-medium tracking-tight no-underline"
          >
            benai timur
          </a>

          <div className="hidden md:flex items-center gap-1">
            <a
              href="#platform"
              className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full"
            >
              Скиллы
            </a>
            <a
              href="#solutions"
              className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full"
            >
              Кейсы
            </a>
            <a
              href="#experience"
              className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full"
            >
              Опыт
            </a>
            <a
              href="#support"
              className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full"
            >
              Коннект
            </a>
          </div>

          <button
            type="button"
            className="mobile-menu-toggle md:hidden"
            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>

          <a
            href="#support"
            className="nav-contact bg-white text-black text-sm font-normal rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Связаться
          </a>

          {isMobileMenuOpen && (
            <div id="mobile-navigation" className="mobile-navigation md:hidden">
              <a href="#platform" onClick={() => setIsMobileMenuOpen(false)}>Скиллы</a>
              <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)}>Кейсы</a>
              <a href="#experience" onClick={() => setIsMobileMenuOpen(false)}>Опыт</a>
              <a href="#support" onClick={() => setIsMobileMenuOpen(false)}>Коннект</a>
            </div>
          )}
        </nav>

        <div className="relative h-full w-full">
          <div className="hero-copy absolute left-4 md:left-10 top-[18%]">
            <h1 className="hero-title text-white font-medium text-[14vw] md:text-[13vw]">
              рай
            </h1>
            <p className="hero-description absolute right-4 top-[9vh] md:top-[25vh] max-w-[240px] text-[15px] leading-snug text-white/90">
              дизайн + 3d + разработка. один человек вместо 3 специалистов
            </p>
          </div>

          <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] right-4 md:right-10 top-[38%]">
            для
          </h1>

          <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] left-[18%] md:left-[28%] top-[58%]">
            глаз
          </h1>

          <div className="absolute right-6 md:right-24 top-[14%]">
            <span className="stat-value text-4xl md:text-5xl font-medium tracking-tight text-white">
              2023
            </span>
            <p className="text-xs md:text-sm text-white/70 mt-1 text-right">
              год старта
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />

          <div className="absolute left-6 md:left-20 bottom-20 md:bottom-24">
            <span className="stat-value text-4xl md:text-5xl font-medium tracking-tight text-white">
              +9
            </span>
            <p className="text-xs md:text-sm text-white/70 mt-1">
              инструментов
            </p>
          </div>

          <div className="absolute right-6 md:right-20 bottom-16 md:bottom-20">
            <span className="stat-value text-4xl md:text-5xl font-medium tracking-tight text-white">
              +30
            </span>
            <p className="text-xs md:text-sm text-white/70 mt-1 text-right">
              проектов
            </p>
          </div>
        </div>
      </section>

      <section
        ref={servicesRef}
        id="platform"
        className="services-section"
        aria-label="Скиллы"
      >
        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceItem
              key={service.number}
              {...service}
              index={index}
              isVisible={servicesVisible}
            />
          ))}
        </div>
      </section>

      <section
        ref={archiveRef}
        id="solutions"
        className={`archive-section${archiveVisible ? ' is-visible' : ''}`}
        aria-labelledby="archive-heading"
      >
        <div className="archive-intro">
          <h2 id="archive-heading">
            <span className="archive-heading-highlight">Дело моих</span>
            <br />
            рук
          </h2>
          <div className="archive-copy">
            <p>
              Каждый кейс - это история о том, как идея превращается в готовый продукт, а усилия в измеримый результат для заказчика или команды.
            </p>
            <div className="archive-actions">
              <a
                className="archive-button archive-button-primary"
                href="https://t.me/HustlifyCasesBot"
                target="_blank"
                rel="noopener noreferrer"
              >
                Все кейсы <span aria-hidden="true">↗</span>
              </a>
              <a
                className="archive-button archive-button-secondary"
                href="/blender"
                target="_blank"
                rel="noopener noreferrer"
              >
                3D Портфолио <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="archive-gallery" id="case-gallery">
          {archiveCards.map((card, index) => (
            <ArchiveCard
              key={card.title}
              {...card}
              index={index}
              isVisible={archiveVisible}
            />
          ))}
        </div>
      </section>

      <section id="experience" className="exp" aria-labelledby="experience-heading">
  <h2 id="experience-heading" className="sr-only">ОПЫТ</h2>

  <div className="exp-stage">
    <video
      ref={experienceVideoRef}
      className="exp-video"
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      aria-hidden="true"
    />

    <svg className="exp-heading" viewBox="0 0 1000 300" aria-hidden="true">
      <text
        x="0"
        y="240"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
      >
        ОПЫТ
      </text>
    </svg>

    <div className="exp-topline">
      <p>3D &amp; Digital Designer &amp;<br />Frontend Developer</p>
      <p>Pet Projects &amp; Freelance<br />2023 - Настоящее время</p>
    </div>

    <div className="exp-descriptions">
      <p>UI &amp; UX: Дизайн сайтов и<br />веб интерфейсов</p>
      <p>3D: GameDev &amp; Анимации</p>
      <p>Dev: Сборка рабочих<br />сайтов/ботов/приложений</p>
    </div>

    <div className="exp-tools" aria-label="Инструменты и технологии">
      <img
        src="/experience-tools.png"
        alt="Claude, Bolt, Spline, Figma, Blender, Lightroom, GitHub, Vercel и Visual Studio Code"
      />
    </div>
  </div>
</section>

      <section
        id="support"
        className="connect-section"
        aria-labelledby="support-heading"
      >
        <div className="connect-actions">
          <a
            className="connect-action connect-action-primary"
            href="https://t.me/w1t3chlyyy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
          <a
            className="connect-action"
            href="tel:+79944821648"
            target="_blank"
            rel="noopener noreferrer"
          >
            Позвонить
          </a>
          <a
            className="connect-action"
            href="mailto:w1t3chlyyy@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Почта
          </a>
        </div>
        <h2 id="support-heading" className="connect-heading">
          СЛОВИМ КОННЕКТ?
        </h2>
      </section>
    </>
  );
}

function BlenderPage() {
  return (
    <main className="blender-page">
      <div className="blender-page-content">
        <p className="blender-page-eyebrow">S K I L L S / 0 2</p>
        <h1>Blender</h1>
        <p className="blender-page-note">Страница скоро появится.</p>
        <a
          className="blender-page-back"
          href="/#top"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">←</span> На главную
        </a>
      </div>
    </main>
  );
}
