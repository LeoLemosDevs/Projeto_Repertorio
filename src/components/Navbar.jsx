import { Link } from 'react-router-dom';
import { Music, CalendarDays, Settings } from 'lucide-react';
import '../styles/theme.css';

export default function Navbar() {
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
        alignItems: 'center'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
          <Music />
          <span>Repertório Lemos</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" className="btn-secondary" style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            <CalendarDays size={18} /> Feed
          </Link>
          <Link to="/admin" className="btn-primary" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>
            <Settings size={18} /> Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
