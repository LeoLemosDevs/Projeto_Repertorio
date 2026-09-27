import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import EventView from './pages/EventView';
import SongView from './pages/SongView';
import './index.css';

function App() {
  return (
    <HashRouter>
      <Navbar />
      <main className="container" style={{ padding: '2rem 1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/event/:id" element={<EventView />} />
          <Route path="/song/:id" element={<SongView />} />
        </Routes>
      </main>
    </HashRouter>
  );
}

export default App;
