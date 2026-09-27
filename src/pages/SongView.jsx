import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, PlayCircle, Plus, Minus, Music as MusicIcon } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const notesList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function SongView() {
  const { id } = useParams();
  const location = useLocation();
  const { eventId, currentSongIndex } = location.state || {}; // Pra voltar pro evento certo
  
  const [song, setSong] = useState(null);
  const [toneIndex, setToneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const docRef = doc(db, "songs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSong({ id: docSnap.id, ...data });
          
          const idx = notesList.indexOf(data.originalTone || 'C');
          setToneIndex(idx !== -1 ? idx : 0);
        }
      } catch (error) {
        console.error("Erro ao buscar música:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  // Auto scroll logic (simplified)
  useEffect(() => {
    let interval;
    if (isPlaying && song) {
      // scrollSpeed salva em segundos na criação. Convertemos pra milisegundos de intervalo pro setInterval (estimativa simples)
      // Um número menor no intervalo = mais rápido.
      const intervalMs = (song.scrollSpeed || 60) * 1000 / window.document.body.scrollHeight || 50;
      interval = setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isPlaying, song]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Carregando música...</div>;
  if (!song) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Música não encontrada.</div>;

  const currentTone = notesList[(toneIndex + 12) % 12];

  const transposeTone = (step) => {
    setToneIndex((prev) => prev + step);
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Left Column: Lyrics and Info */}
      <div style={{ flex: '1 1 600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <Link to={eventId ? `/event/${eventId}` : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '1rem' }}>
              <ArrowLeft size={16} /> Voltar {eventId ? 'para o Culto' : 'para Home'}
            </Link>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{song.title}</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '1.1rem' }}>{song.singer}</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tom</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => transposeTone(-1)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><Minus size={16} /></button>
              <strong style={{ fontSize: '1.5rem', color: 'var(--color-primary)', minWidth: '2rem', textAlign: 'center' }}>{currentTone}</strong>
              <button onClick={() => transposeTone(1)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><Plus size={16} /></button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ backgroundColor: isPlaying ? 'var(--color-danger)' : 'var(--color-primary)' }}
          >
            <PlayCircle size={20} /> {isPlaying ? 'Pausar Rolagem' : 'Iniciar Rolagem'}
          </button>
          {song.youtube && (
            <a href={song.youtube} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Ver no YouTube
            </a>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '2rem', fontSize: '1.2rem', lineHeight: '1.8' }}>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-main)' }}>
            {song.lyrics || "Nenhuma letra cadastrada."}
          </div>
        </div>
      </div>

      {/* Right Column: Musical Notes / Chords */}
      <div style={{ flex: '1 1 300px', position: 'sticky', top: '100px', height: 'fit-content' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--color-primary)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <MusicIcon size={20} /> Notas Musicais
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ 
                fontFamily: 'var(--font-family-music)', 
                whiteSpace: 'pre-wrap', 
                fontSize: '1.1rem',
                color: 'var(--color-primary-dark)',
                backgroundColor: 'var(--color-bg-elevated)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)'
              }}>
                {song.chords || "Nenhuma cifra cadastrada."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
