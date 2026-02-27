import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Stubs for future pages
import Dashboard from './pages/Dashboard';
import Distributors from './pages/Distributors';
import DistributorProfile from './pages/DistributorProfile';
import CreditEvaluation from './pages/CreditEvaluation';
import Alerts from './pages/Alerts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="distributors" element={<Distributors />} />
          <Route path="distributors/:id" element={<DistributorProfile />} />
          <Route path="evaluation" element={<CreditEvaluation />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
