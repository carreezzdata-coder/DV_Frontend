'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionProvider, useSession } from '@/components/includes/Session';

interface LoginFormData {
  identifier: string;
  password: string;
}

function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({});
  
  const router = useRouter();
  const { login, isAuthenticated, isLoading: sessionLoading, user } = useSession();

  useEffect(() => {
    if (!sessionLoading && isAuthenticated && user) {
      router.push('/admin');
    }
  }, [isAuthenticated, sessionLoading, user, router]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof LoginFormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (error) {
      setError('');
    }
  }, [fieldErrors, error]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<LoginFormData> = {};
    
    if (!formData.identifier.trim()) {
      errors.identifier = 'Username or phone is required' as any;
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required' as any;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters' as any;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await login({
        identifier: formData.identifier.trim(),
        password: formData.password.trim()
      });
      
      if (result.success && result.authenticated && result.user) {
        router.push('/admin');
      } else {
        const errorMsg = result.error || 'Login failed. Please try again.';
        setError(errorMsg);
      }
      
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, isSubmitting, login, router]);

  if (sessionLoading) {
    return (
      <div className="dvlogin-container">
        <div className="dvlogin-wrapper">
          <div className="dvlogin-panel">
            <div className="dvlogin-loading">
              <div className="dvlogin-spinner">⚡</div>
              <p className="dvlogin-loading-text">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="dvlogin-container">
      <div className="dvlogin-wrapper">
        <div className="dvlogin-panel">
          <form onSubmit={handleSubmit} noValidate>
            <div className="dvlogin-header">
              <div className="dvlogin-logo">
                <div className="dvlogin-logo-icon">🚀</div>
              </div>
              <h1 className="dvlogin-title">Daily Vaibe</h1>
              <p className="dvlogin-subtitle">Sign in to your dashboard</p>
            </div>

            {error && (
              <div className="dvlogin-error-alert" role="alert">
                <span className="dvlogin-error-icon">⚠️</span>
                <p className="dvlogin-error-text">{error}</p>
              </div>
            )}

            <div className="dvlogin-field">
              <label htmlFor="identifier" className="dvlogin-label">
                <span className="dvlogin-label-icon">👤</span>
                Username or Phone
              </label>
              <div className="dvlogin-input-wrapper">
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Enter your username or phone number"
                  required
                  disabled={isSubmitting}
                  className={`dvlogin-input ${fieldErrors.identifier ? 'dvlogin-input-error' : ''}`}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
              {fieldErrors.identifier && (
                <span className="dvlogin-field-error" role="alert">
                  {fieldErrors.identifier as string}
                </span>
              )}
            </div>

            <div className="dvlogin-field">
              <label htmlFor="password" className="dvlogin-label">
                <span className="dvlogin-label-icon">🔒</span>
                Password
              </label>
              <div className="dvlogin-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                  className={`dvlogin-input ${fieldErrors.password ? 'dvlogin-input-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="dvlogin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="dvlogin-field-error" role="alert">
                  {fieldErrors.password as string}
                </span>
              )}
            </div>

            <button type="submit" className="dvlogin-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="dvlogin-spinner">⚡</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span className="dvlogin-submit-icon">🔓</span>
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="dvlogin-footer">
              <button type="button" className="dvlogin-request-btn" disabled>
                <span>🔒</span>
                <span>Request Access</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginForm />
    </SessionProvider>
  );
}
