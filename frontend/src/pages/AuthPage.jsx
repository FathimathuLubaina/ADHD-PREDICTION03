import React from 'react';
import { LoginCard, RegisterCard } from '../components/AuthCard';

export default function AuthPage() {
  return (
    <main className="app-main">
      <div className="hero-grid">
        <LoginCard />
        <RegisterCard />
      </div>
    </main>
  );
}

