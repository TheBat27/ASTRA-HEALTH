import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-space-950 text-white overflow-hidden bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-track-space-800 scrollbar-thumb-space-600">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
