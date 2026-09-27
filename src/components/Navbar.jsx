import { Link, useLocation } from 'react-router-dom';
import { Music, CalendarDays, Settings, Library } from 'lucide-react';
import '../styles/theme.css';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      padding: '1rem',
      boxShadow: 'var(--shadow-md)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <Music />
          <span>Repertório Lemos</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/" className={location.pathname === '/' ? "btn-primary" : "btn-secondary"} style={location.pathname === '/' ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' } : { backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            <CalendarDays size={18} /> Página Principal
          </Link>
          <Link to="/letras" className={location.pathname === '/letras' ? "btn-primary" : "btn-secondary"} style={location.pathname === '/letras' ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' } : { backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Library size={18} /> Letras
          </Link>
          <Link to="/admin" className={location.pathname === '/admin' ? "btn-primary" : "btn-secondary"} style={location.pathname === '/admin' ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' } : { backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Settings size={18} /> Configurações
          </Link>
        </div>
      </div>
    </nav>
  );
}
