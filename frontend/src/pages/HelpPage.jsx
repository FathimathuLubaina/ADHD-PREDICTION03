import React from 'react';

export default function HelpPage() {
  return (
    <main className="app-main">
      <header className="info-hero">
        <div className="info-hero-content">
          <span className="pill pill-soft">Support</span>
          <h1 className="info-hero-title">Help &amp; Support</h1>
          <p className="info-hero-sub">
            This platform is a starting point for self‑reflection. If you are concerned about your own attention,
            activity levels, or emotional wellbeing – or that of a child – professional guidance is essential.
          </p>
        </div>
      </header>

      <section className="info-content">
        <article className="info-card info-help-card">
          <div className="info-help-badge">Psychology Dept</div>
          <p>
            For personalised support, students and families are encouraged to contact the{' '}
            <strong>Psychology Department</strong> of Sri Kanyaka Parameswari Arts &amp; Science College For Women.
            They can help you interpret your scores, understand ADHD and related conditions, and recommend appropriate
            next steps.
          </p>
        </article>
        <article className="info-card info-help-card info-card-warn">
          <div className="info-help-badge">Crisis</div>
          <p>
            If you are experiencing acute distress, thoughts of self‑harm, or a mental health emergency, please contact
            local emergency services or a trusted helpline immediately. This website does not provide crisis support.
          </p>
        </article>
        <article className="info-card info-help-card info-card-accent">
          <p>
            Remember: asking for help is a sign of strength. Neurodivergent traits are common, real, and manageable –
            you do not have to navigate them alone.
          </p>
        </article>
      </section>
    </main>
  );
}
