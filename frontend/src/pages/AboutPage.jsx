import React from 'react';

export default function AboutPage() {
  return (
    <main className="app-main">
      <header className="info-hero">
        <div className="info-hero-content">
          <span className="pill pill-soft">Our mission</span>
          <h1 className="info-hero-title">About the ADHD Awareness Platform</h1>
          <p className="info-hero-sub">
            This digital space was created by Sri Kanyaka Parameswari Arts &amp; Science College For Women to promote
            informed, compassionate conversations around Attention‑Deficit/Hyperactivity Disorder (ADHD) in India.
          </p>
        </div>
      </header>

      <section className="info-content">
        <article className="info-card">
          <p>
            ADHD is a neurodevelopmental condition that affects attention, impulse control, and activity levels. In
            India, many students and adults experience ADHD‑related challenges without clear information or access to
            timely support. Cultural stigma and lack of awareness often delay help‑seeking.
          </p>
        </article>
        <article className="info-card">
          <p>
            This platform aims to bridge that gap by offering a calm, privacy‑respecting screening experience built
            around globally recognised ADHD question patterns for both adults and children. Your responses can help you
            notice trends, prepare for clinical consultations, or simply understand yourself or your child better.
          </p>
        </article>
        <article className="info-card info-card-accent">
          <p>
            We strongly believe in neurodiversity – the idea that different brains experience the world in different
            ways. ADHD is not a personal failure or laziness. With recognition, support, and accommodations, individuals
            with ADHD can thrive in academics, workplaces, and personal life.
          </p>
        </article>
        <article className="info-card">
          <p>
            This tool is <strong>not</strong> a substitute for a formal diagnosis. It is a starting point for awareness,
            designed to work alongside the expertise of psychiatrists, psychologists, counsellors, and educators.
          </p>
        </article>
      </section>
    </main>
  );
}
