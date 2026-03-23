import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: 'adhd_token',
  user: 'adhd_user',
  latestAssessment: 'adhd_latest_assessment'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.token);
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    const storedAssessment = localStorage.getItem(STORAGE_KEYS.latestAssessment);
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
      try {
        if (storedAssessment) setLatestAssessment(JSON.parse(storedAssessment));
      } catch {
        setLatestAssessment(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    setToken(data.token);
    setUser(data.user);
    setLatestAssessment(data.latestAssessment || null);
    localStorage.setItem(STORAGE_KEYS.token, data.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    if (data.latestAssessment) {
      localStorage.setItem(STORAGE_KEYS.latestAssessment, JSON.stringify(data.latestAssessment));
    } else {
      localStorage.removeItem(STORAGE_KEYS.latestAssessment);
    }
  };

  const markAssessmentCompleted = useCallback((assessment) => {
    const formatted = {
      totalScore: assessment.total_score,
      result: assessment.result,
      gender: assessment.gender,
      ageGroup: assessment.age_group,
      createdAt: assessment.created_at
    };
    setLatestAssessment(formatted);
    localStorage.setItem(STORAGE_KEYS.latestAssessment, JSON.stringify(formatted));
    setUser((prev) => (prev ? { ...prev, assessmentCompleted: true } : prev));
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    if (stored) {
      const u = JSON.parse(stored);
      u.assessmentCompleted = true;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
    }
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
    setLatestAssessment(null);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.latestAssessment);
  };

  const value = {
    user,
    token,
    latestAssessment,
    loading,
    isAuthenticated: !!token,
    assessmentCompleted: !!user?.assessmentCompleted,
    login,
    logout,
    markAssessmentCompleted,
    apiClient: api(token)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

