/**
 * History page with integrated analytics.
 * Uses stored assessment data: total_score, result, created_at.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function getResultVariant(result) {
  if (!result) return 'neutral';
  if (result.includes('Unlikely')) return 'safe';
  if (result.includes('Possible')) return 'warn';
  return 'attention';
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

// Map result to Likely / Not Likely ADHD
function isLikelyADHD(result) {
  if (!result || typeof result !== 'string') return false;
  const r = result.toLowerCase();
  return r.includes('high likelihood') || r.includes('possible');
}

function isNotLikelyADHD(result) {
  if (!result || typeof result !== 'string') return false;
  return result.toLowerCase().includes('unlikely');
}

const SCORE_RANGES = [
  { label: '0–20', min: 0, max: 20 },
  { label: '21–40', min: 21, max: 40 },
  { label: '41–60', min: 41, max: 60 },
  { label: '61–80', min: 61, max: 80 },
  { label: '81–100', min: 81, max: 100 }
];

export default function HistoryPage() {
  const { apiClient } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const res = await apiClient.get('/assessments/history');
        setHistory(res.data.history || []);
      } catch (err) {
        console.error(err);
        setError('Could not load history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiClient]);

  const latest = history[0];
  const totalCount = history.length;

  // Analytics stats computed from history (existing stored data)
  const stats = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) {
      return {
        total: 0,
        likelyCount: 0,
        notLikelyCount: 0,
        likelyPct: 0,
        notLikelyPct: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        scoreBuckets: SCORE_RANGES.map((r) => ({ ...r, count: 0 })),
        trendData: []
      };
    }

    const likelyCount = history.filter((a) => isLikelyADHD(a.result)).length;
    const notLikelyCount = history.filter((a) => isNotLikelyADHD(a.result)).length;
    const total = history.length;

    const scores = history.map((a) => Number(a.total_score ?? 0)).filter((s) => !isNaN(s));
    const sum = scores.reduce((acc, s) => acc + s, 0);
    const avgScore = scores.length ? Math.round((sum / scores.length) * 10) / 10 : 0;
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;

    const scoreBuckets = SCORE_RANGES.map((range) => ({
      ...range,
      count: history.filter((a) => {
        const s = Number(a.total_score ?? 0);
        return !isNaN(s) && s >= range.min && s <= range.max;
      }).length
    }));

    const byDate = {};
    history.forEach((a) => {
      const date = a.created_at ? a.created_at.split('T')[0] : 'unknown';
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(Number(a.total_score ?? 0));
    });
    const trendData = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date,
        label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
        avgScore: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
        count: vals.length
      }));

    return {
      total,
      likelyCount,
      notLikelyCount,
      likelyPct: total ? Math.round((likelyCount / total) * 1000) / 10 : 0,
      notLikelyPct: total ? Math.round((notLikelyCount / total) * 1000) / 10 : 0,
      avgScore,
      maxScore,
      minScore,
      scoreBuckets,
      trendData
    };
  }, [history]);

  const otherCount = stats.total - stats.likelyCount - stats.notLikelyCount;
  const doughnutData = useMemo(() => {
    const labels = ['Likely ADHD', 'Not Likely ADHD'];
    const data = [stats.likelyCount, stats.notLikelyCount];
    const bg = ['#2b7a78', '#94a3b8'];
    if (otherCount > 0) {
      labels.push('Other');
      data.push(otherCount);
      bg.push('#cbd5e1');
    }
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bg,
          borderWidth: 0,
          hoverBackgroundColor: bg.map((c) => (c === '#2b7a78' ? '#118a7e' : c === '#94a3b8' ? '#64748b' : '#94a3b8'))
        }
      ]
    };
  }, [stats.likelyCount, stats.notLikelyCount, stats.total, otherCount]);

  const barData = useMemo(
    () => ({
      labels: stats.scoreBuckets.map((b) => b.label),
      datasets: [
        {
          label: 'Number of assessments',
          data: stats.scoreBuckets.map((b) => b.count),
          backgroundColor: 'rgba(43, 122, 120, 0.7)',
          borderColor: '#2b7a78',
          borderWidth: 1
        }
      ]
    }),
    [stats.scoreBuckets]
  );

  const lineData = useMemo(
    () => ({
      labels: stats.trendData.map((d) => d.label),
      datasets: [
        {
          label: 'Average score',
          data: stats.trendData.map((d) => d.avgScore),
          fill: true,
          backgroundColor: 'rgba(43, 122, 120, 0.15)',
          borderColor: '#2b7a78',
          borderWidth: 2,
          tension: 0.3
        }
      ]
    }),
    [stats.trendData]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
  };

  const barOptions = {
    ...chartOptions,
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  const lineOptions = {
    ...chartOptions,
    scales: { y: { beginAtZero: true, suggestedMax: 100 } }
  };

  return (
    <main className="app-main">
      <header className="history-hero">
        <div className="history-hero-content">
          <span className="pill pill-soft">Your journey</span>
          <h1 className="history-hero-title">Assessment history</h1>
          <p className="history-hero-sub">
            Review past screenings, track patterns, and share insights with a mental health professional.
          </p>
          {!loading && totalCount > 0 && (
            <div className="history-stats">
              <div className="history-stat">
                <span className="history-stat-value">{totalCount}</span>
                <span className="history-stat-label">Total assessments</span>
              </div>
              <div className="history-stat">
                <span className="history-stat-value">{latest?.total_score ?? '—'}</span>
                <span className="history-stat-label">Latest score</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Analytics section - summary cards & charts */}
      {!loading && !error && history.length > 0 && (
        <section className="history-analytics">
          <h2 className="history-analytics-title">Analytics</h2>
          <div className="analytics-cards">
            <div className="analytics-card">
              <span className="analytics-card-value">{stats.total}</span>
              <span className="analytics-card-label">Total assessments</span>
            </div>
            <div className="analytics-card analytics-card-likely">
              <span className="analytics-card-value">{stats.likelyCount}</span>
              <span className="analytics-card-label">Likely ADHD</span>
            </div>
            <div className="analytics-card analytics-card-not-likely">
              <span className="analytics-card-value">{stats.notLikelyCount}</span>
              <span className="analytics-card-label">Not Likely ADHD</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-card-value">{stats.likelyPct}%</span>
              <span className="analytics-card-label">% Likely ADHD</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-card-value">{stats.notLikelyPct}%</span>
              <span className="analytics-card-label">% Not Likely ADHD</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-card-value">{stats.avgScore}</span>
              <span className="analytics-card-label">Average score</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-card-value">{stats.maxScore}</span>
              <span className="analytics-card-label">Highest score</span>
            </div>
            <div className="analytics-card">
              <span className="analytics-card-value">{stats.minScore}</span>
              <span className="analytics-card-label">Lowest score</span>
            </div>
          </div>
          <div className="analytics-charts">
            <div className="chart-card analytics-chart-card">
              <h3 className="chart-heading">Result distribution</h3>
              <p className="chart-subtext">Likely ADHD vs Not Likely ADHD</p>
              <div className="analytics-chart-wrap">
                <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '60%' }} />
              </div>
            </div>
            <div className="chart-card analytics-chart-card">
              <h3 className="chart-heading">Score distribution</h3>
              <p className="chart-subtext">Assessments per score range</p>
              <div className="analytics-chart-wrap analytics-chart-bar">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
            <div className="chart-card analytics-chart-card analytics-chart-full">
              <h3 className="chart-heading">Score trend over time</h3>
              <p className="chart-subtext">Average score by submission date</p>
              <div className="analytics-chart-wrap analytics-chart-line">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* History cards */}
      <section className="history-content">
        {loading ? (
          <div className="history-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="history-card-skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="history-empty-card">
            <div className="history-empty-icon">!</div>
            <p className="history-empty-title">Unable to load history</p>
            <p className="history-empty-text">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="history-empty-card">
            <div className="history-empty-icon">📋</div>
            <h3 className="history-empty-title">No assessments yet</h3>
            <p className="history-empty-text">
              Complete your first ADHD screening on the Home page. Your results will appear here so you can
              track patterns over time.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
              Go to assessment
            </button>
          </div>
        ) : (
          <>
            <h2 className="history-list-title">Your assessments</h2>
            <div className="history-cards">
              {history.map((h) => {
                const variant = getResultVariant(h.result);
                return (
                  <article key={h.id} className={`history-item-card history-item-${variant}`}>
                    <div className="history-item-header">
                      <span className="history-item-score">{h.total_score}</span>
                      <span className={`history-item-badge history-badge-${variant}`}>{h.result}</span>
                    </div>
                    <div className="history-item-meta">
                      <span>{h.gender} · {h.age_group}</span>
                      <time dateTime={h.created_at}>{formatFullDate(h.created_at)}</time>
                    </div>
                    <div className="history-item-footer">
                      <span className="history-item-date">{formatDate(h.created_at)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
