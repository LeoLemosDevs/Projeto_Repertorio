import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowDown, PlayCircle, PauseCircle, Plus, Minus, Music as MusicIcon, ZoomIn, ZoomOut, FastForward, Rewind } from 'lucide-react';
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

  const handleManualScroll = (direction) => {
    window.scrollBy({ top: direction === 'up' ? -200 : 200, behavior: 'smooth' });
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Carregando música...</div>;
  if (!song) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Música não encontrada.</div>;

  const currentTone = notesList[(toneIndex + 12) % 12];
  const transposeTone = (step) => setToneIndex((prev) => prev + step);

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

        {/* Barra de Controles de Leitura (Velocidade, Fonte, Play/Pause) */}
        <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', padding: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ backgroundColor: isPlaying ? 'var(--color-danger)' : 'var(--color-primary)', flex: '1 1 auto', justifyContent: 'center' }}
          >
            {isPlaying ? <><PauseCircle size={20} /> Pausar</> : <><PlayCircle size={20} /> Tocar / Rolar</>}
          </button>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setSpeedMultiplier(prev => prev * 1.2)} title="Mais Devagar">
              <Rewind size={18} /> Devagar
            </button>
            <button className="btn-secondary" onClick={() => setSpeedMultiplier(prev => prev * 0.8)} title="Mais Rápido">
              Rápido <FastForward size={18} />
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setFontSize(prev => Math.max(1, prev - 0.2))} title="Diminuir Letra">
              <ZoomOut size={18} />
            </button>
            <button className="btn-secondary" onClick={() => setFontSize(prev => Math.min(3, prev + 0.2))} title="Aumentar Letra">
              <ZoomIn size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => handleManualScroll('up')} title="Voltar Letra">
              <ArrowUp size={18} /> Voltar
            </button>
            <button className="btn-secondary" onClick={() => handleManualScroll('down')} title="Descer Letra">
              <ArrowDown size={18} /> Pular
            </button>
          </div>
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

      {/* Letra da Música */}
      <div className="glass-panel" style={{ padding: '2rem', fontSize: `${fontSize}rem`, lineHeight: '1.8', transition: 'font-size 0.2s' }}>
        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-main)' }}>
          {song.lyrics || "Nenhuma letra cadastrada."}
        </div>
      </div>
      
      {/* Espaço extra */}
      <div style={{ height: '70vh' }}></div>

    </div>
  );
}
