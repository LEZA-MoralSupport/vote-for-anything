import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Edit from './pages/Edit'
import Vote from './pages/Vote'
import Score from './pages/Score'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/edit/new" element={<Edit />} />
      <Route path="/edit/:id" element={<Edit />} />
      <Route path="/vote/:id" element={<Vote />} />
      <Route path="/score/:id" element={<Score />} />
    </Routes>
  )
}
