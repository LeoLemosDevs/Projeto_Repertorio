import { useState, useEffect } from 'react';
import { Music, CalendarPlus, Save } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('songs');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Estados para a Música
  const [songTitle, setSongTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('C');
  const [lyrics, setLyrics] = useState('');
  const [chords, setChords] = useState('');
  const [youtube, setYoutube] = useState('');
  const [scrollSpeed, setScrollSpeed] = useState(60);

  // Estados para Eventos
  const [availableSongs, setAvailableSongs] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTheme, setEventTheme] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);

  // Busca músicas no banco para o form de eventos
  useEffect(() => {
    if (activeTab === 'events') {
      const fetchSongs = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "songs"));
          const songsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAvailableSongs(songsList);
        } catch (error) {
          console.error("Erro ao buscar músicas: ", error);
        }
      };
      fetchSongs();
    }
  }, [activeTab]);

  const handleSaveSong = async () => {
    if (!songTitle) {
      alert("O título da música é obrigatório!");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "songs"), {
        title: songTitle,
        singer: singer,
        genre: genre,
        originalTone: tone,
        lyrics: lyrics,
        chords: chords,
        youtube: youtube,
        scrollSpeed: Number(scrollSpeed),
        createdAt: serverTimestamp()
      });
      setSuccessMsg('Música salva com sucesso!');
      setSongTitle(''); setSinger(''); setGenre(''); setLyrics(''); setChords(''); setYoutube('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Erro ao salvar música: " + e.message);
    }
    setLoading(false);
  };

  const handleSaveEvent = async () => {
    if (!eventTitle || !eventDate) {
      alert("Título e Data são obrigatórios!");
      return;
    }
    setLoading(true);
    try {
      // Buscar os detalhes das músicas selecionadas
      const songsToSave = availableSongs
        .filter(s => selectedSongs.includes(s.id))
        .map(s => ({ id: s.id, title: s.title, tone: s.originalTone, status: 'pending' }));

      await addDoc(collection(db, "events"), {
        title: eventTitle,
        theme: eventTheme,
        date: eventDate,
        time: eventTime,
        songs: songsToSave,
        createdAt: serverTimestamp()
      });
      setSuccessMsg('Evento agendado com sucesso!');
      setEventTitle(''); setEventTheme(''); setEventDate(''); setEventTime(''); setSelectedSongs([]);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Erro ao salvar evento: " + e.message);
    }
    setLoading(false);
  };

  const handleMultiSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedSongs(value);
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Painel Administrativo</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('songs')}
          className={activeTab === 'songs' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1 }}
        >
          <Music size={20} /> Cadastrar Músicas
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1 }}
        >
          <CalendarPlus size={20} /> Agendar Culto / Evento
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {successMsg && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        {activeTab === 'songs' ? (
          <div>
            <h2 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Nova Música</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título da Música *</label>
                <input type="text" className="input-field" value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="Ex: Grande é o Senhor" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cantor/Banda</label>
                  <input type="text" className="input-field" value={singer} onChange={e => setSinger(e.target.value)} placeholder="Nome do cantor" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Gênero</label>
                  <input type="text" className="input-field" value={genre} onChange={e => setGenre(e.target.value)} placeholder="Ex: Adoração" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tom Original</label>
                <select className="input-field" value={tone} onChange={e => setTone(e.target.value)}>
                  {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Letra da Música (use quebras de linha normais)</label>
                <textarea className="input-field" rows={6} value={lyrics} onChange={e => setLyrics(e.target.value)} placeholder="Cole a letra aqui..."></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cifras / Notas (pode deixar em branco por enquanto)</label>
                <textarea className="input-field" rows={4} value={chords} onChange={e => setChords(e.target.value)} placeholder="Cole as cifras aqui..."></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Link do YouTube</label>
                <input type="url" className="input-field" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tempo de Rolagem Automática (segundos)</label>
                <input type="number" className="input-field" value={scrollSpeed} onChange={e => setScrollSpeed(e.target.value)} placeholder="60" />
              </div>
              <button onClick={handleSaveSong} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Save size={20} /> {loading ? 'Salvando...' : 'Salvar Música'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Novo Agendamento</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título do Evento *</label>
                <input type="text" className="input-field" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Ex: Culto de Domingo da Família" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tema</label>
                <input type="text" className="input-field" value={eventTheme} onChange={e => setEventTheme(e.target.value)} placeholder="Ex: Louvores para Família" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Data *</label>
                  <input type="date" className="input-field" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Hora</label>
                  <input type="time" className="input-field" value={eventTime} onChange={e => setEventTime(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Selecionar Músicas do Repertório</label>
                {availableSongs.length === 0 ? (
                  <p style={{ color: 'var(--color-warning)' }}>Nenhuma música cadastrada ainda. Vá na aba "Músicas" primeiro.</p>
                ) : (
                  <select className="input-field" multiple style={{ height: '200px' }} value={selectedSongs} onChange={handleMultiSelect}>
                    {availableSongs.map(s => (
                      <option key={s.id} value={s.id}>{s.title} ({s.originalTone})</option>
                    ))}
                  </select>
                )}
                <small style={{ color: 'var(--color-text-muted)' }}>Segure Ctrl (ou Cmd) no teclado para selecionar várias músicas.</small>
              </div>
              <button onClick={handleSaveEvent} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Save size={20} /> {loading ? 'Salvando...' : 'Criar Evento e Gerar Postagem'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
