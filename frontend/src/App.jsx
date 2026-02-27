import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const DistributorProfile = React.lazy(() => import('./pages/DistributorProfile'));
const CreditEvaluation = React.lazy(() => import('./pages/CreditEvaluation'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Landing = React.lazy(() => import('./pages/Landing'));
const Distributors = React.lazy(() => import('./pages/Distributors'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Toaster />
      <BrowserRouter>
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/welcome" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="distributors" element={<Distributors />} />
              <Route path="distributors/:id" element={<DistributorProfile />} />

              <Route
                path="evaluation"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'RiskOfficer']}>
                    <CreditEvaluation />
                  </ProtectedRoute>
                }
              />

              <Route
                path="alerts"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <Alerts />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
