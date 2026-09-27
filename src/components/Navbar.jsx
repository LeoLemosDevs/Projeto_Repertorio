import { Link, useLocation } from 'react-router-dom';
import { Music, Home, CalendarDays, Settings, Library, CalendarPlus } from 'lucide-react';
import '../styles/theme.css';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      padding: '0.5rem 1rem', // Padding reduzido
      boxShadow: 'var(--shadow-md)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'nowrap', // Força a ficar numa linha
        gap: '0.5rem'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <Music size={20} />
          <span>REPERTÓRIO</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/" title="Página Principal" className={location.pathname === '/' ? "btn-active" : "btn-secondary"} style={{ padding: '0.5rem' }}>
            <Home size={20} />
          </Link>
          <Link to="/letras" title="Letras" className={location.pathname === '/letras' ? "btn-active" : "btn-secondary"} style={{ padding: '0.5rem' }}>
            <Library size={20} />
          </Link>
          <Link to="/eventos-admin" title="Eventos (CRUD)" className={location.pathname === '/eventos-admin' ? "btn-active" : "btn-secondary"} style={{ padding: '0.5rem' }}>
            <CalendarPlus size={20} />
          </Link>
          <Link to="/admin" title="Configurações (Músicas)" className={location.pathname === '/admin' ? "btn-active" : "btn-secondary"} style={{ padding: '0.5rem' }}>
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
