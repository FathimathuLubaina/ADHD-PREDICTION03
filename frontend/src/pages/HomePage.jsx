import React, { useEffect, useMemo, useState } from 'react';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adultQuestions, kidQuestions, scoringOptions, getPrediction } from '../utils/questions';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ResultBlock({ result, gender, localAgeGroup, savedToServer, emailSent, navigate }) {
  return (
    <div className="result-card result-card-below" style={{ marginTop: 24 }}>
      <div className="result-inner">
        <h3 className="result-section-title">What This Result Means</h3>
        <div className="result-score">{result.totalScore}</div>
        <div className="result-label">{result.result}</div>
        {emailSent && (
          <p className="result-email-sent">
            A copy of your report has been sent to your registered email.
          </p>
        )}
        {!savedToServer && (
          <p className="result-unsaved-note">
            Result not saved to your history (backend issue). Log in and ensure the backend is running to save.
          </p>
        )}
        <div className="result-meta">
          <span>
            Context: <strong>{gender || '—'}</strong>, <strong>{localAgeGroup || '—'}</strong>
          </span>
          <span>
            Recorded at:{' '}
            {result.createdAt ? new Date(result.createdAt).toLocaleString() : 'Just now'}
          </span>
          {savedToServer && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ borderColor: '#a5b4fc', color: '#e5e7eb' }}
              onClick={() => navigate('/history')}
            >
              View full history
            </button>
          )}
        </div>
        <div className="result-guidance">
          <ul>
            <li>This assessment provides an initial snapshot based on your responses to the questionnaire.</li>
            <li>It helps identify patterns that may be associated with ADHD symptoms.</li>
            <li>The results are not a medical diagnosis and should only be used for awareness.</li>
            <li>If you notice persistent symptoms such as difficulty concentrating, impulsiveness, or hyperactivity, consider speaking with a qualified healthcare professional.</li>
            <li>A licensed doctor or mental health specialist can provide a full evaluation and recommend appropriate support or treatment if necessary.</li>
          </ul>
          <p className="result-disclaimer">
            This assessment is <strong>not</strong> a medical diagnosis. Please consult a qualified
            psychiatrist, psychologist, or mental health professional for proper evaluation and diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { theme, ageGroup, setAgeGroup } = useThemeMode();
  const { apiClient, assessmentCompleted, latestAssessment, markAssessmentCompleted } = useAuth();

  useEffect(() => {
    if (assessmentCompleted && !latestAssessment) {
      apiClient.get('/assessments/history').then((res) => {
        const list = res.data?.history || [];
        if (list.length > 0) {
          const a = list[0];
          markAssessmentCompleted({
            total_score: a.total_score,
            result: a.result,
            gender: a.gender,
            age_group: a.age_group,
            created_at: a.created_at
          });
        }
      }).catch(() => {});
    }
  }, [assessmentCompleted, latestAssessment, apiClient, markAssessmentCompleted]);
  const [gender, setGender] = useState('');
  const [localAgeGroup, setLocalAgeGroup] = useState(ageGroup || '');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [savedToServer, setSavedToServer] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const isAdult = localAgeGroup === 'Adult';
  const questions = isAdult ? adultQuestions : kidQuestions;

  const canStartAssessment = gender && localAgeGroup;

  const handleSelector = (type, value) => {
    if (type === 'gender') {
      setGender(value);
    } else {
      setLocalAgeGroup(value);
      setAgeGroup(value);
    }
    setResult(null);
    setSavedToServer(false);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!canStartAssessment) return;
    const arr = questions.map((_, idx) => answers[idx] ?? 0);
    const { totalScore, result: prediction } = getPrediction(arr, localAgeGroup);
    const localResult = {
      totalScore,
      result: prediction,
      createdAt: new Date().toISOString()
    };

    setSubmitting(true);
    try {
      const res = await apiClient.post('/assessments', {
        gender,
        ageGroup: localAgeGroup,
        answers: arr
      });
      const record = res.data.assessment;
      setResult({
        totalScore: record.total_score,
        result: record.result,
        createdAt: record.created_at
      });
      setSavedToServer(true);
      setEmailSent(res.data.emailSent === true);
      markAssessmentCompleted(record);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        const data = err.response?.data;
        const stored = data?.latestAssessment;
        setSubmitError(data?.message || 'You have already completed the assessment.');
        if (stored) {
          const formatted = {
            totalScore: stored.total_score,
            result: stored.result,
            createdAt: stored.created_at
          };
          setResult(formatted);
          setSavedToServer(true);
          markAssessmentCompleted({
            total_score: stored.total_score,
            result: stored.result,
            gender: stored.gender,
            age_group: stored.age_group,
            created_at: stored.created_at
          });
        } else if (latestAssessment) {
          setResult({
            totalScore: latestAssessment.totalScore,
            result: latestAssessment.result,
            createdAt: latestAssessment.createdAt
          });
          setSavedToServer(true);
        }
      } else {
        setResult(localResult);
        setSavedToServer(false);
        if (!err.response) {
          setSubmitError('Could not save to server. Your result is shown below. (Is the backend running on port 5000?)');
        } else if (err.response?.status === 401) {
          setSubmitError('Session expired. Please log in again. Your result is shown below.');
        } else {
          setSubmitError(
            (err.response?.data?.message || 'Could not save to server.') +
              ' Your result is shown below.'
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = useMemo(
    () => ({
      labels: ['Diagnosed Neurodivergent (4%)', 'Undiagnosed Neurodivergent (8%)', 'Neurotypical (88%)'],
      datasets: [
        {
          data: [4, 8, 88],
          backgroundColor: ['#2B7A78', '#F2994A', '#E5E7EB'],
          borderWidth: 0
        }
      ]
    }),
    []
  );

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 }
        }
      }
    },
    cutout: '68%'
  };

  return (
    <main className="app-main">
      <div className="hero-grid">
        <section className="hero-card">
          <div className="hero-eyebrow">
            <span>Neurodivergence-aware screening</span>
          </div>
          <h1 className="hero-heading">
            A calm space to explore{''}
            <span className="hero-highlight">ADHD traits</span> with evidence based questions.
          </h1>
          <p className="hero-subtext">
            This platform is designed by{' '}
            <span className="hero-subtext-strong">
              Sri Kanyaka Parameswari Arts &amp; Science College For Women
            </span>{' '}
            to gently guide students, adults, and families in understanding attention and hyperactivity patterns.
          </p>
          <div className="hero-footer">
            {!assessmentCompleted && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  const el = document.getElementById('age-gender-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start awareness check
              </button>
            )}
            <div className="hero-meta">
              <div className="hero-stat">
                <span className="hero-stat-label">Built for</span>
                <span className="hero-stat-value">Students & Adults</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">Focus</span>
                <span className="hero-stat-value">India · Urban & Rural</span>
              </div>
            </div>
          </div>
        </section>
      
        <aside className="hero-side-card">
          <div className="hero-side-header">
            <div>
              <div className="hero-side-title">Why early awareness matters</div>
              <div className="hero-side-tagline">
                ADHD is common and highly manageable when recognised early.
              </div>
            </div>
            <span className="badge-soft">Neurodiversity &amp; care</span>
          </div>
          <div className="chips-row">
            <span className="pill pill-info">Reduces self‑stigma</span>
            <span className="pill pill-warn">Prevents academic burnout</span>
            <span className="pill pill-safe">Supports mental wellbeing</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: 6 }}>
            This is a self‑reflection screening, not a diagnosis. Your responses can be a starting point for
            meaningful conversations with a qualified mental health professional.
          </p>
        </aside>
      </div>

      {assessmentCompleted && latestAssessment && (
        <section className="page-section" id="assessment-section">
          <ResultBlock
            result={latestAssessment}
            gender={latestAssessment.gender}
            localAgeGroup={latestAssessment.ageGroup}
            savedToServer
            emailSent={emailSent}
            navigate={navigate}
          />
        </section>
      )}

      {!assessmentCompleted && (
      <>
      <section className="page-section" id="age-gender-section">
        <div className="grid grid-2">
          <div className="card">
            <h2 className="page-title">Step 1 · Tell us about yourself</h2>
            <p className="page-subtitle">
              Choose the gender and age group so we can switch to the appropriate ADHD assessment and visual theme.
            </p>
            <div className="page-section selector-grid">
              <button
                type="button"
                className={
                  'selector-card' +
                  (gender === 'Male' ? ' selector-card-active' : '')
                }
                onClick={() => handleSelector('gender', 'Male')}
              >
                <div className="selector-title">Male</div>
                <div className="selector-sub">Covers focus, impulsivity, and restlessness patterns.</div>
                <div className="selector-meta">
                  <span className="selector-badge">Gender</span>
                  <span>Any age</span>
                </div>
              </button>
              <button
                type="button"
                className={
                  'selector-card' +
                  (gender === 'Female' ? ' selector-card-active' : '')
                }
                onClick={() => handleSelector('gender', 'Female')}
              >
                <div className="selector-title">Female</div>
                <div className="selector-sub">
                  Sensitive to inattentive presentations that are often overlooked.
                </div>
                <div className="selector-meta">
                  <span className="selector-badge">Gender</span>
                  <span>Any age</span>
                </div>
              </button>
            </div>

            <div className="page-section selector-grid">
              <button
                type="button"
                className={
                  'selector-card' +
                  (localAgeGroup === 'Adult' ? ' selector-card-active' : '')
                }
                onClick={() => handleSelector('age', 'Adult')}
              >
                <div className="selector-title">Adult (18+)</div>
                <div className="selector-sub">
                  20 ADHD‑aligned questions exploring work, relationships, and daily responsibilities.
                </div>
                <div className="selector-meta">
                  <span className="selector-badge">Adult theme</span>
                  <span>Age 18 and above</span>
                </div>
              </button>
              <button
                type="button"
                className={
                  'selector-card' +
                  (localAgeGroup === 'Kid' ? ' selector-card-active' : '')
                }
                onClick={() => handleSelector('age', 'Kid')}
              >
                <div className="selector-title">Kid (&lt;18)</div>
                <div className="selector-sub">
                  15 child‑friendly questions focused on classroom, play, and home behaviour.
                </div>
                <div className="selector-meta">
                  <span className="selector-badge">Kids theme</span>
                  <span>Below 18 years</span>
                </div>
              </button>
            </div>

            <div className="cta-band">
              <span>
                <strong>Both selections are needed.</strong> This ensures that the scoring ranges and visual design
                match your context.
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!canStartAssessment}
                onClick={() => {
                  const el = document.getElementById('assessment-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Go to assessment
              </button>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-heading">Neurodivergence Awareness in India</h3>
            <p className="chart-subtext">
              Research suggests that a significant proportion of neurodivergent individuals in India remain
              undiagnosed. Awareness‑first tools like this can prompt supportive conversations.
            </p>
            <div style={{ maxWidth: 320, margin: '0 auto' }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <ul style={{ marginTop: 10, fontSize: '0.78rem', color: '#4b5563', paddingLeft: 18 }}>
              <li>
                <strong>4% diagnosed neurodivergent</strong> – receiving active support and accommodations.
              </li>
              <li>
                <strong>8% likely undiagnosed</strong> – may experience challenges without formal recognition.
              </li>
              <li>
                <strong>88% neurotypical</strong> – still benefit from inclusive, mentally healthy environments.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-section" id="assessment-section">
        <form onSubmit={handleSubmit} className="assessment-questions">
            <div className="question-header">
              <div>
                <div className="pill pill-soft">
                  {isAdult ? 'Adult ADHD assessment' : 'Child ADHD assessment'}
                </div>
                <h2 className="page-title" style={{ marginTop: 10 }}>
                  Step 2 · Respond to each question
                </h2>
                <p className="page-subtitle">
                  Use the dropdown to indicate how often each statement feels true. Be honest and think about the
                  last 6 months.
                </p>
              </div>
            </div>

            {!canStartAssessment && (
              <p className="error-text" style={{ marginTop: 10 }}>
                Please select gender and age group above before starting the assessment.
              </p>
            )}

            <div className="page-section stack">
              {questions.map((q, idx) => (
                <div key={idx} className="question-card">
                  <div className="question-header">
                    <div className="question-index">Q{idx + 1}</div>
                    <span className="badge-soft">
                      {isAdult ? 'Adult item' : 'Child item'}
                    </span>
                  </div>
                  <div className="question-text">{q}</div>
                  <div className="question-meta">
                    <span>Never → Very Often</span>
                    <div style={{ minWidth: 120 }}>
                      <select
                        className="select"
                        value={answers[idx] ?? ''}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        disabled={!canStartAssessment}
                      >
                        <option value="">Select</option>
                        {scoringOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} ({opt.value})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {submitError && (
              <p className="error-text" style={{ marginBottom: 12 }}>{submitError}</p>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={!canStartAssessment || submitting}
            >
              {submitting ? 'Calculating result…' : 'Submit assessment'}
            </button>
          </form>

        {result && (
          <div className="result-card result-card-below" style={{ marginTop: 24 }}>
            <div className="result-inner">
              <h3 className="result-section-title">What This Result Means</h3>
              <div className="result-score">{result.totalScore}</div>
              <div className="result-label">{result.result}</div>
              {!savedToServer && (
                <p className="result-unsaved-note">
                  Result not saved to your history (backend issue). Log in and ensure the backend is running to save.
                </p>
              )}
              <div className="result-meta">
                <span>
                  Context: <strong>{gender || '—'}</strong>,{' '}
                  <strong>{localAgeGroup || '—'}</strong>
                </span>
                <span>
                  Recorded at:{' '}
                  {result.createdAt
                    ? new Date(result.createdAt).toLocaleString()
                    : 'Just now'}
                </span>
                {savedToServer && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ borderColor: '#a5b4fc', color: '#e5e7eb' }}
                    onClick={() => navigate('/history')}
                  >
                    View full history
                  </button>
                )}
              </div>
              <div className="result-guidance">
                <ul>
                  <li>This assessment provides an initial snapshot based on your responses to the questionnaire.</li>
                  <li>It helps identify patterns that may be associated with ADHD symptoms.</li>
                  <li>The results are not a medical diagnosis and should only be used for awareness.</li>
                  <li>If you notice persistent symptoms such as difficulty concentrating, impulsiveness, or hyperactivity, consider speaking with a qualified healthcare professional.</li>
                  <li>A licensed doctor or mental health specialist can provide a full evaluation and recommend appropriate support or treatment if necessary.</li>
                </ul>
                <p className="result-disclaimer">
                  This assessment is <strong>not</strong> a medical diagnosis. Please consult a qualified
                  psychiatrist, psychologist, or mental health professional for proper evaluation and diagnosis.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
      </>
      )}
    </main>
  );
}

