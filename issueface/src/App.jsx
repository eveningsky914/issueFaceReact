import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Introduction from './pages/Introduction';
import Analysis from './pages/Analysis';
import CountryBackground from './pages/CountryBackground';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intro" element={<Introduction />} />
        <Route path="/history" element={<History />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/country/:cca2" element={<CountryBackground />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
