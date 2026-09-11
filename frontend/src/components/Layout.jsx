import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import ToastContainer from './ToastContainer';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Pages that don't need a sidebar: Landing Page, Login, Register, Public Verify
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/verify/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex w-full">
        {!isPublicPage && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 min-w-0 ${!isPublicPage ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
          <Outlet />
        </main>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
}
