import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EventView() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [localSongs, setLocalSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEvent({ id: docSnap.id, ...data });
          // Adiciona um originalIndex para rastrear a posição no banco
          setLocalSongs((data.songs || []).map((s, i) => ({ ...s, originalIndex: i })));
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const toggleStatus = async (e, localIndex) => {
    e.preventDefault(); // Prevent navigation
    if (!event) return;
    
    // Atualiza o status no estado local
    const newSongs = [...localSongs];
    newSongs[localIndex].status = newSongs[localIndex].status === 'done' ? 'pending' : 'done';
    setLocalSongs(newSongs);

    // Atualiza o status no Firebase mantendo a ordem original
    try {
      const firebaseSongs = [...newSongs]
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(({ originalIndex, ...rest }) => rest); // remove originalIndex
        
      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, { songs: firebaseSongs });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const moveSong = (e, index, direction) => {
    e.preventDefault();
    const newSongs = [...localSongs];
    if (direction === 'up' && index > 0) {
      [newSongs[index - 1], newSongs[index]] = [newSongs[index], newSongs[index - 1]];
    } else if (direction === 'down' && index < newSongs.length - 1) {
      [newSongs[index + 1], newSongs[index]] = [newSongs[index], newSongs[index + 1]];
    }
    setLocalSongs(newSongs);
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Carregando evento...</div>;
  if (!event) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Evento não encontrado.</div>;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Voltar para o Feed
        </Link>
        <h1 style={{ color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{event.title}</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Tema: {event.theme || 'Sem tema'}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {localSongs.map((song, index) => (
          <Link key={song.originalIndex} to={`/song/${song.id}`} state={{ eventId: event.id, currentSongIndex: index }} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '1rem',
              borderLeft: `4px solid ${song.status === 'done' ? 'var(--color-success)' : 'var(--color-primary)'}`,
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-accent-border)' }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>{song.title}</h3>
                  <span style={{ display: 'inline-block', backgroundColor: 'var(--color-bg-elevated)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                    Tom: {song.tone}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button 
                    onClick={(e) => moveSong(e, index, 'up')} 
                    disabled={index === 0} 
                    className="btn-secondary" 
                    style={{ padding: '0.2rem', opacity: index === 0 ? 0.3 : 1 }}
                    title="Mover para cima"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    onClick={(e) => moveSong(e, index, 'down')} 
                    disabled={index === localSongs.length - 1} 
                    className="btn-secondary" 
                    style={{ padding: '0.2rem', opacity: index === localSongs.length - 1 ? 0.3 : 1 }}
                    title="Mover para baixo"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                
                <button 
                  onClick={(e) => toggleStatus(e, index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: song.status === 'done' ? 'var(--color-success)' : 'var(--color-accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    transition: 'color 0.2s',
                    marginLeft: '0.5rem'
                  }}
                  title={song.status === 'done' ? 'Marcar como não cantado' : 'Marcar como cantado'}
                >
                  {song.status === 'done' ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                </button>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
