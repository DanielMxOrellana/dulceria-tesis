import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import './Auth.css';

export default function AuthPage() {
  const { login, register } = useApp();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    if (mode === 'login') {
      const res = login(form.email, form.password);
      if (res.error) setError(res.error);
    } else if (mode === 'register') {
      if (!form.name.trim()) return setError('El nombre es requerido.');
      const res = register(form.name, form.email, form.password);
      if (res.error) setError(res.error);
    } else {
      // Forgot
      setSuccessMsg('Si el correo existe, recibirás instrucciones para restablecer tu contraseña.');
    }
  };

  const demo = (role) => {
    if (role === 'admin') login('admin@dulceria.com', '123456');
    else login('maria@email.com', '123456');
  };

  return (
    <div className="auth-page">
      <div className="auth-deco">
        <div className="deco-circle deco-1" />
        <div className="deco-circle deco-2" />
        <div className="deco-circle deco-3" />
        <div className="auth-brand">
          <span className="auth-brand-icon">🍬</span>
          <h1>Dulcería Artesanal</h1>
          <p>Los mejores dulces hechos con amor</p>
          <div className="auth-features">
            <div className="auth-feature">🌸 Macarons frescos</div>
            <div className="auth-feature">🍫 Chocolate artesanal</div>
            <div className="auth-feature">🧁 Cupcakes personalizados</div>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-logo">🍬</div>
        <h2>
          {mode === 'login' ? 'Bienvenido de vuelta' :
           mode === 'register' ? 'Crear cuenta' : 'Recuperar contraseña'}
        </h2>
        <p className="auth-sub">
          {mode === 'login' ? 'Inicia sesión para hacer tus pedidos' :
           mode === 'register' ? 'Regístrate para comenzar a pedir' :
           'Ingresa tu correo y te enviaremos instrucciones'}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Nombre completo</label>
              <div className="input-icon">
                <User size={16} />
                <input name="name" type="text" placeholder="Tu nombre" value={form.name} onChange={handle} required />
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Correo electrónico</label>
            <div className="input-icon">
              <Mail size={16} />
              <input name="email" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={handle} required />
            </div>
          </div>
          {mode !== 'forgot' && (
            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-icon">
                <Lock size={16} />
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handle} required />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <button type="button" className="forgot-link" onClick={() => { setMode('forgot'); setError(''); }}>
              ¿Olvidaste tu contraseña?
            </button>
          )}

          <button type="submit" className="btn btn-primary btn-lg auth-submit">
            {mode === 'login' ? 'Iniciar sesión' :
             mode === 'register' ? 'Crear cuenta' : 'Enviar instrucciones'}
          </button>
        </form>

        <div className="auth-divider"><span>o</span></div>

        {mode === 'login' && (
          <div className="demo-btns">
            <p className="demo-label">Acceso de demostración:</p>
            <div className="demo-row">
              <button className="btn btn-secondary" onClick={() => demo('admin')}>🔑 Admin</button>
              <button className="btn btn-secondary" onClick={() => demo('client')}>👤 Cliente</button>
            </div>
            <p className="demo-note">Contraseña: 123456</p>
          </div>
        )}

        <div className="auth-switch">
          {mode === 'login' ? (
            <>¿No tienes cuenta? <button onClick={() => { setMode('register'); setError(''); }}>Regístrate</button></>
          ) : (
            <>¿Ya tienes cuenta? <button onClick={() => { setMode('login'); setError(''); }}>Inicia sesión</button></>
          )}
        </div>
      </div>
    </div>
  );
}
