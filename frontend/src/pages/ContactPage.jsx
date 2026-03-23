import React from 'react';

export default function ContactPage() {
  return (
    <main className="app-main">
      <header className="info-hero">
        <div className="info-hero-content">
          <span className="pill pill-soft">Get in touch</span>
          <h1 className="info-hero-title">Contact</h1>
          <p className="info-hero-sub">
            If you have questions about this ADHD awareness platform or would like to collaborate, you can reach the
            creator at the details below.
          </p>
        </div>
      </header>

      <section className="info-content info-content-grid">
        <article className="info-card info-contact-card">
          <div className="info-contact-icon">👤</div>
          <h3 className="info-contact-heading">Contact Person</h3>
          <div className="info-contact-list">
            <p><strong>Name:</strong> Fathimathu Lubaina</p>
            <p><strong>Phone:</strong> +91 123456789</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:fathimathulubaina@gmail.com" className="info-link">
                fathimathulubaina@gmail.com
              </a>
            </p>
          </div>
        </article>
        <article className="info-card info-contact-card">
          <div className="info-contact-icon">📍</div>
          <h3 className="info-contact-heading">Location</h3>
          <div className="info-contact-list">
            <p>Sri Kanyaka Parameswari Arts &amp; Science College For Women</p>
            <p>1, Audiappa St, George Town</p>
            <p>Chennai, Tamil Nadu 600001</p>
          </div>
        </article>
      </section>
    </main>
  );
}
