import { useEffect, useState } from 'react'
import Header from './components/Header'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('currentUser')
    if (u) setCurrentUser(JSON.parse(u))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <Header onLogout={handleLogout} />
      <main className="relative max-w-6xl mx-auto p-6">
        {!currentUser ? (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white tracking-tight">Internship & Placement Portal</h1>
              <p className="text-blue-200/80 mt-2">Create your profile, discover opportunities, and track your journey end-to-end.</p>
            </div>
            <Auth onLogin={setCurrentUser} />
          </div>
        ) : (
          <div className="mt-6">
            <Dashboard />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
