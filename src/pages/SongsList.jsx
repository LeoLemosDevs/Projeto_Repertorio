import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Music, ChevronRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function SongsList() {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const q = query(collection(db, "songs"), orderBy("title", "asc"));
        const snapshot = await getDocs(q);
        const songsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSongs(songsData);
      } catch (error) {
        console.error("Erro ao buscar músicas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter(song => 
    song.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.singer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Acervo de Letras</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Todas as músicas cadastradas no repertório</p>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Search size={20} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder="Pesquisar por título ou cantor..." 
          className="input-field" 
          style={{ border: 'none', boxShadow: 'none', backgroundColor: 'transparent', padding: '0.5rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center' }}>Carregando letras...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredSongs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Nenhuma música encontrada.</div>
          ) : (
            filteredSongs.map(song => (
              <Link key={song.id} to={`/song/${song.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass-panel" style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s',
                  borderLeft: '4px solid var(--color-primary)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: '0.5rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                      <Music size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-primary)', fontSize: '1.1rem' }}>{song.title}</h3>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {song.singer || 'Cantor não informado'} • Tom: {song.originalTone || 'C'}
                      </div>
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
      )}
    </div>
  );
}
