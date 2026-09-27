import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Carregando eventos...</div>;
  }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Próximos Eventos</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Acesse o repertório dos próximos cultos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
        {events.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Nenhum evento agendado no momento.
          </div>
        ) : (
          events.map(event => (
            <Link key={event.id} to={`/event/${event.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-panel" style={{
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>{event.title}</h2>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Tema:</strong> {event.theme || 'Sem tema definido'}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {event.date}</span>
                    {event.time && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {event.time}</span>}
                    <span style={{ backgroundColor: 'var(--color-accent)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-pill)', color: 'var(--color-primary)' }}>
                      {(event.songs || []).length} Músicas
                    </span>
                  </div>
                </div>
                <div style={{ color: 'var(--color-primary-light)' }}>
                  <ChevronRight size={24} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
