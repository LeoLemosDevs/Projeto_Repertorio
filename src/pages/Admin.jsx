import { useState, useEffect } from 'react';
import { Music, CalendarPlus, Save, Lock, LogIn, Trash2, ArrowUp, ArrowDown, X, Edit, XCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function Admin({ initialTab = 'songs' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Estados para a Música
  const [editingSongId, setEditingSongId] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [singer, setSinger] = useState('');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('C');
  const [lyrics, setLyrics] = useState('');
  const [chords, setChords] = useState('');
  const [youtube, setYoutube] = useState('');
  const [scrollSpeed, setScrollSpeed] = useState(60);

  // Estados para Eventos e Lista Global de Músicas
  const [availableSongs, setAvailableSongs] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTheme, setEventTheme] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]); // [{id, title, tone}]
  
  // Lista de Eventos Cadastrados
  const [eventsList, setEventsList] = useState([]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      (username === 'admin' && password === 'admin') ||
      (username === 'leo' && password === 'leo123')
    ) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  // Busca músicas e eventos no banco
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const qSongs = query(collection(db, "songs"), orderBy("title"));
          const songsSnap = await getDocs(qSongs);
          setAvailableSongs(songsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          
          if (activeTab === 'events') {
            const qEvents = query(collection(db, "events"), orderBy("createdAt", "desc"));
            const eventsSnap = await getDocs(qEvents);
            setEventsList(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        } catch (error) {
          console.error("Erro ao buscar dados: ", error);
        }
      };
      fetchData();
    }
  }, [activeTab, isAuthenticated]);

  const clearSongForm = () => {
    setEditingSongId(null);
    setSongTitle(''); setSinger(''); setGenre(''); setTone('C');
    setLyrics(''); setChords(''); setYoutube(''); setScrollSpeed(60);
  };

  const handleSaveSong = async () => {
    if (!songTitle) {
      alert("O título da música é obrigatório!");
      return;
    }
    setLoading(true);
    try {
      const songData = {
        title: songTitle,
        singer: singer,
        genre: genre,
        originalTone: tone,
        lyrics: lyrics,
        chords: chords,
        youtube: youtube,
        scrollSpeed: Number(scrollSpeed)
      };

      if (editingSongId) {
        // Editar
        await updateDoc(doc(db, "songs", editingSongId), songData);
        setSuccessMsg('Música atualizada com sucesso!');
        setAvailableSongs(availableSongs.map(s => s.id === editingSongId ? { id: editingSongId, ...songData } : s));
      } else {
        // Criar Nova
        const docRef = await addDoc(collection(db, "songs"), {
          ...songData,
          createdAt: serverTimestamp()
        });
        setSuccessMsg('Música salva com sucesso!');
        setAvailableSongs([...availableSongs, { id: docRef.id, ...songData }].sort((a,b) => a.title.localeCompare(b.title)));
      }
      
      clearSongForm();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Erro ao salvar música: " + e.message);
    }
    setLoading(false);
  };

  const handleEditSong = (song) => {
    setEditingSongId(song.id);
    setSongTitle(song.title || '');
    setSinger(song.singer || '');
    setGenre(song.genre || '');
    setTone(song.originalTone || 'C');
    setLyrics(song.lyrics || '');
    setChords(song.chords || '');
    setYoutube(song.youtube || '');
    setScrollSpeed(song.scrollSpeed || 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSong = async (id) => {
    if(window.confirm("Tem certeza que deseja EXCLUIR esta música definitivamente?")) {
      try {
        await deleteDoc(doc(db, "songs", id));
        setAvailableSongs(availableSongs.filter(s => s.id !== id));
        setSuccessMsg('Música excluída com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (e) {
        alert("Erro ao excluir música: " + e.message);
      }
    }
  };

  const clearEventForm = () => {
    setEditingEventId(null);
    setEventTitle(''); setEventTheme(''); setEventDate(''); setEventTime(''); setSelectedSongs([]);
  };

  const handleSaveEvent = async () => {
    if (!eventTitle || !eventDate) {
      alert("Título e Data são obrigatórios!");
      return;
    }
    if (selectedSongs.length === 0) {
      alert("Adicione pelo menos uma música!");
      return;
    }
    setLoading(true);
    try {
      // Se tiver ID de música, mantemos status pending; se for nova ou alterada.
      // O ideal é manter o status se a música for a mesma. 
      // Mas para simplificar a reordenação/adição, setaremos tudo para pending ou reusaremos o status se já existir.
      // Como não guardamos o status original na array de selectedSongs na edição (para não complicar), resetaremos para pending se editada a ordem.
      const songsToSave = selectedSongs.map(s => ({ id: s.id, title: s.title, tone: s.tone, status: s.status || 'pending' }));

      const eventData = {
        title: eventTitle,
        theme: eventTheme,
        date: eventDate,
        time: eventTime,
        songs: songsToSave
      };

      if (editingEventId) {
        await updateDoc(doc(db, "events", editingEventId), eventData);
        setSuccessMsg('Programação atualizada com sucesso!');
        setEventsList(eventsList.map(e => e.id === editingEventId ? { ...e, ...eventData } : e));
      } else {
        const docRef = await addDoc(collection(db, "events"), {
          ...eventData,
          createdAt: serverTimestamp()
        });
        setSuccessMsg('Evento agendado com sucesso!');
        setEventsList([{ id: docRef.id, ...eventData }, ...eventsList]);
      }
      
      clearEventForm();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Erro ao salvar evento: " + e.message);
    }
    setLoading(false);
  };

  const handleEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setEventTitle(ev.title || '');
    setEventTheme(ev.theme || '');
    setEventDate(ev.date || '');
    setEventTime(ev.time || '');
    setSelectedSongs(ev.songs || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (id) => {
    if(window.confirm("Tem certeza que deseja excluir esta programação?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        setEventsList(eventsList.filter(e => e.id !== id));
        setSuccessMsg('Evento excluído com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (e) {
        alert("Erro ao excluir: " + e.message);
      }
    }
  };

  const addSongToEvent = (e) => {
    const songId = e.target.value;
    if(!songId) return;
    const song = availableSongs.find(s => s.id === songId);
    if(song) {
      setSelectedSongs([...selectedSongs, { id: song.id, title: song.title, tone: song.originalTone, status: 'pending' }]);
    }
    e.target.value = ""; // reset dropdown
  };

  const moveSong = (index, direction) => {
    const newSongs = [...selectedSongs];
    if (direction === 'up' && index > 0) {
      [newSongs[index - 1], newSongs[index]] = [newSongs[index], newSongs[index - 1]];
    } else if (direction === 'down' && index < newSongs.length - 1) {
      [newSongs[index + 1], newSongs[index]] = [newSongs[index], newSongs[index + 1]];
    }
    setSelectedSongs(newSongs);
  };

  const removeSong = (index) => {
    setSelectedSongs(selectedSongs.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    return (
      <div className="animate-slide-up" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>
            <Lock size={48} />
          </div>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Acesso Restrito</h2>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Usuário" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
            {loginError && <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', margin: 0 }}>{loginError}</p>}
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              <LogIn size={20} /> Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>
        {activeTab === 'songs' ? 'Configurações (Músicas)' : 'Gerenciar Eventos'}
      </h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => { setActiveTab('songs'); clearSongForm(); }}
          className={activeTab === 'songs' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1 }}
        >
          <Music size={20} /> Músicas
        </button>
        <button 
          onClick={() => { setActiveTab('events'); clearEventForm(); }}
          className={activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}
          style={{ flex: 1 }}
        >
          <CalendarPlus size={20} /> Agendar Evento
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>{editingSongId ? 'Editar Música' : 'Nova Música'}</h2>
              {editingSongId && (
                <button onClick={clearSongForm} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                  <XCircle size={16} /> Cancelar Edição
                </button>
              )}
            </div>
            
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
                  {['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
                    'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Letra da Música</label>
                <textarea className="input-field" rows={6} value={lyrics} onChange={e => setLyrics(e.target.value)} placeholder="Cole a letra aqui..."></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cifras / Notas</label>
                <textarea className="input-field" rows={4} value={chords} onChange={e => setChords(e.target.value)} placeholder="Cole as cifras aqui..."></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Link do YouTube</label>
                <input type="url" className="input-field" value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Velocidade Rolagem (segundos)</label>
                <input type="number" className="input-field" value={scrollSpeed} onChange={e => setScrollSpeed(e.target.value)} placeholder="60" />
              </div>
              <button onClick={handleSaveSong} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Save size={20} /> {loading ? 'Salvando...' : (editingSongId ? 'Atualizar Música' : 'Salvar Nova Música')}
              </button>
            </div>

            {/* Listagem de Músicas para Editar/Excluir */}
            <div style={{ marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
              <h2 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Músicas Cadastradas</h2>
              {availableSongs.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma música cadastrada.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {availableSongs.map(song => (
                    <div key={song.id} className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--color-text-main)', display: 'block' }}>{song.title}</strong>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{song.singer || 'Sem cantor'} • Tom: {song.originalTone}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditSong(song)} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} title="Editar Música">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteSong(song.id)} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} title="Excluir Música">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>{editingEventId ? 'Editar Programação' : 'Novo Agendamento'}</h2>
              {editingEventId && (
                <button onClick={clearEventForm} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                  <XCircle size={16} /> Cancelar Edição
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título do Evento *</label>
                <input type="text" className="input-field" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Ex: Culto de Domingo" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tema</label>
                <input type="text" className="input-field" value={eventTheme} onChange={e => setEventTheme(e.target.value)} placeholder="Ex: Louvores de Adoração" />
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
              
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Adicionar Música à Ordem do Culto</label>
                <select className="input-field" onChange={addSongToEvent} value="">
                  <option value="" disabled>Selecione uma música...</option>
                  {availableSongs.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>

                {selectedSongs.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedSongs.map((song, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-main)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', marginRight: '0.5rem', color: 'var(--color-primary)' }}>{idx + 1}.</span>
                          {song.title} ({song.tone})
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button onClick={() => moveSong(idx, 'up')} disabled={idx === 0} className="btn-secondary" style={{ padding: '0.3rem' }}><ArrowUp size={14}/></button>
                          <button onClick={() => moveSong(idx, 'down')} disabled={idx === selectedSongs.length - 1} className="btn-secondary" style={{ padding: '0.3rem' }}><ArrowDown size={14}/></button>
                          <button onClick={() => removeSong(idx)} className="btn-secondary" style={{ padding: '0.3rem', color: 'var(--color-danger)' }}><X size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSaveEvent} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Save size={20} /> {loading ? 'Salvando...' : (editingEventId ? 'Atualizar Programação' : 'Criar Programação')}
              </button>
            </div>

            {/* Listagem de Programações */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
              <h2 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Programações Agendadas</h2>
              {eventsList.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma programação cadastrada.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {eventsList.map(ev => (
                    <div key={ev.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{ev.title}</strong>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{ev.date} • {ev.songs?.length || 0} músicas</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditEvent(ev)} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} title="Editar Programação">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteEvent(ev.id)} className="btn-secondary" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)', padding: '0.5rem' }} title="Excluir Programação">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
