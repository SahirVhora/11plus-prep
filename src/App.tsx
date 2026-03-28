import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SettingsModal } from './components/layout/SettingsModal';
import { Home } from './pages/Home';
import { Quiz } from './pages/Quiz';
import { About } from './pages/About';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/11plus-prep">
        <div className="min-h-screen flex flex-col bg-bg dark:bg-slate-900">
          <Header />
          <SettingsModal />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
