
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/upload" element={<Upload />} />
        <Route path="*" element={<div>Accueil du projet Webmedia</div>} />
      </Routes>
    </Router>
  );
}

export default App;
