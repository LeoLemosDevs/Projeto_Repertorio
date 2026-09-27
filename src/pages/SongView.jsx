import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, PlayCircle, PauseCircle, Plus, Minus, Music as MusicIcon, ZoomIn, ZoomOut, FastForward, Rewind } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const notesList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function SongView() {
  const { id } = useParams();
  const location = useLocation();
  const { eventId, currentSongIndex } = location.state || {};
  
  const [song, setSong] = useState(null);
  const [toneIndex, setToneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Novos controles de leitura
  const [fontSize, setFontSize] = useState(1.4); // em rem
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1 = normal, 0.5 = rápido, 2 = devagar

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

  useEffect(() => {
    let interval;
    if (isPlaying && song) {
      const baseIntervalMs = (song.scrollSpeed || 60) * 1000 / window.document.body.scrollHeight || 50;
      const actualInterval = baseIntervalMs * speedMultiplier;
      interval = setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }, actualInterval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, song, speedMultiplier]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Carregando música...</div>;
  if (!song) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Música não encontrada.</div>;

  const currentTone = notesList[(toneIndex + 12) % 12];
  const transposeTone = (step) => setToneIndex((prev) => prev + step);

  return (
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* Bloco 100% Fixo no Topo (Cabeçalho + Notas + Controles) */}
      <div style={{ 
        position: 'sticky', 
        top: '64px', // Logo abaixo do Navbar
        zIndex: 10, 
        backgroundColor: 'var(--color-bg-main)', // Fundo sólido para esconder a letra passando
        paddingTop: '1rem',
        paddingBottom: '0.5rem'
      }}>
        
        {/* Cabeçalho da Música */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <Link to={eventId ? `/event/${eventId}` : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '0.5rem' }}>
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary)', margin: '0 0 0.25rem 0', lineHeight: 1 }}>{song.title}</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>{song.singer}</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '0.4rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tom</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => transposeTone(-1)} className="btn-secondary" style={{ padding: '0.2rem', borderRadius: '50%' }}><Minus size={14} /></button>
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)', minWidth: '1.2rem', textAlign: 'center' }}>{currentTone}</strong>
              <button onClick={() => transposeTone(1)} className="btn-secondary" style={{ padding: '0.2rem', borderRadius: '50%' }}><Plus size={14} /></button>
            </div>
          </div>
        </div>

        {/* Caixa de Notas */}
        <div className="glass-panel" style={{ padding: '0.75rem', borderTop: '4px solid var(--color-primary)', boxShadow: 'var(--shadow-md)', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '0.9rem' }}>
            <MusicIcon size={14} /> Notas da Música
          </h3>
          <div style={{ 
            fontFamily: 'var(--font-family-music)', 
            whiteSpace: 'pre-wrap', 
            fontSize: '1rem',
            color: 'var(--color-primary-dark)',
            backgroundColor: 'var(--color-bg-elevated)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {song.chords || "Nenhuma cifra cadastrada."}
          </div>
        </div>

        {/* Controles de Leitura (Compactos em uma linha) */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          padding: '0.5rem', 
          alignItems: 'center', 
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <button 
            className="btn-primary" 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ 
              backgroundColor: isPlaying ? 'var(--color-danger)' : 'var(--color-primary)', 
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isPlaying ? <PauseCircle size={18} /> : <PlayCircle size={18} />} 
            <span style={{ fontSize: '0.9rem' }}>{isPlaying ? 'Pausar' : 'Tocar'}</span>
          </button>
          
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-bg-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setSpeedMultiplier(prev => prev * 1.2)} title="Mais Devagar">
              <Rewind size={16} />
            </button>
            <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setSpeedMultiplier(prev => prev * 0.8)} title="Mais Rápido">
              <FastForward size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-bg-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setFontSize(prev => Math.max(1, prev - 0.2))} title="Diminuir Letra">
              <ZoomOut size={16} />
            </button>
            <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setFontSize(prev => Math.min(3, prev + 0.2))} title="Aumentar Letra">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Letra da Música */}
      <div className="glass-panel" style={{ padding: '1.5rem', fontSize: `${fontSize}rem`, lineHeight: '1.8', transition: 'font-size 0.2s', marginTop: '1rem' }}>
        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-main)' }}>
          {song.lyrics || "Nenhuma letra cadastrada."}
        </div>
      </div>
      
      {/* Espaço extra */}
      <div style={{ height: '70vh' }}></div>

    </div>
  );
}
