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
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Cabeçalho da Música */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Link to={eventId ? `/event/${eventId}` : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '1rem' }}>
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{song.title}</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '1rem' }}>{song.singer}</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tom</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => transposeTone(-1)} className="btn-secondary" style={{ padding: '0.25rem', borderRadius: '50%' }}><Minus size={14} /></button>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary)', minWidth: '1.5rem', textAlign: 'center' }}>{currentTone}</strong>
              <button onClick={() => transposeTone(1)} className="btn-secondary" style={{ padding: '0.25rem', borderRadius: '50%' }}><Plus size={14} /></button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ backgroundColor: isPlaying ? 'var(--color-danger)' : 'var(--color-primary)', flex: 1 }}
          >
            <PlayCircle size={20} /> {isPlaying ? 'Pausar Rolagem' : 'Iniciar Rolagem'}
          </button>
          {song.youtube && (
            <a href={song.youtube} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>
              Ver no YouTube
            </a>
          )}
        </div>
      </div>

      {/* Caixa de Notas Fixa no Topo */}
      <div style={{ position: 'sticky', top: '70px', zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: '1rem', borderTop: '4px solid var(--color-primary)', boxShadow: 'var(--shadow-lg)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '1rem' }}>
            <MusicIcon size={16} /> Notas da Música
          </h3>
          <div style={{ 
            fontFamily: 'var(--font-family-music)', 
            whiteSpace: 'pre-wrap', 
            fontSize: '1.1rem',
            color: 'var(--color-primary-dark)',
            backgroundColor: 'var(--color-bg-elevated)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {song.chords || "Nenhuma cifra cadastrada."}
          </div>
        </div>
      </div>

      {/* Letra da Música (O que vai rolar) */}
      <div className="glass-panel" style={{ padding: '2rem', fontSize: '1.4rem', lineHeight: '1.8' }}>
        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-main)' }}>
          {song.lyrics || "Nenhuma letra cadastrada."}
        </div>
      </div>
      
      {/* Espaço extra no final para que a rolagem não pare abruptamente */}
      <div style={{ height: '50vh' }}></div>

    </div>
  );
}
