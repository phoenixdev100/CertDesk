import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import RouteLoader from './components/ui/RouteLoader';
import Landing from './pages/Landing';
import Studio from './pages/Studio';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RouteLoader>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/studio" element={<Studio />} />
          </Routes>
        </RouteLoader>
      </ToastProvider>
    </BrowserRouter>
  );
}
