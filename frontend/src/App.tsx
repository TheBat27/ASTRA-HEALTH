import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Telemetry from './pages/Telemetry'
import Alerts from './pages/Alerts'
import Countermeasures from './pages/Countermeasures'
import CognitiveTest from './pages/CognitiveTest'
import Simulator from './pages/Simulator'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/countermeasures" element={<Countermeasures />} />
          <Route path="/cognitive" element={<CognitiveTest />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
