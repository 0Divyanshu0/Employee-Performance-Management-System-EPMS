// src/screens/Login/Login.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './Login.css';
import loginImage from '../../assets/login-bg-image.png';

import Button from '../../components/Button/Button';
import Label from '../../components/Label/Label.js';
import AuthService from '../../services/auth.service';

function Login({ onLoginSuccess }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    // clear previous API error
    setError('apiError', {});
    try {
      const user = await AuthService.login(data.email, data.password);

      if (!user || !user.id) {
        setError('apiError', {
          type: 'manual',
          message: 'Login returned no user data. Contact admin.',
        });
        return;
      }

      // pass normalized user object up to App
      if (typeof onLoginSuccess === 'function') onLoginSuccess(user);
    } catch (err) {
      setError('apiError', {
        type: 'manual',
        message: err?.message || 'Login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main-container">
      {/* Illustration / left column (hidden on small screens per your CSS) */}
      <div className="login-image-section">
        <img src={loginImage} alt="Login Illustration" className="login-image" />
      </div>

      {/* Form column */}
      <div className="login-form-section">
        <form className="login-form-box" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h1 className="login-title">Login</h1>

          {/* API error */}
          {errors.apiError && errors.apiError.message && (
            <div className="login-error-message" role="alert">
              {errors.apiError.message}
            </div>
          )}

          <div className="login-input-group-container">
            <div>
              <Label text="User Name" htmlFor="email" />
              <input
                id="email"
                type="text"
                placeholder="Enter the username"
                className="login-input"
                autoComplete="username"
                {...register('email', { required: 'User ID is required' })}
              />
              {errors.email && <p className="field-error" style={{ color: '#DC2626', marginTop: 6 }}>{errors.email.message}</p>}
            </div>

            <div>
              <Label text="Password" htmlFor="password" />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="login-input"
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="field-error" style={{ color: '#DC2626', marginTop: 6 }}>{errors.password.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            color="primary"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? 'Authenticating…' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
