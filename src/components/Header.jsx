import { useEffect, useState } from 'react'

export default function Header({ onLogout }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('currentUser')
    if (u) setUser(JSON.parse(u))
  }, [])

  return (
    <header className="w-full border-b border-white/10 bg-slate-900/50 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/flame-icon.svg" alt="Flames" className="w-8 h-8" />
          <span className="text-white font-semibold">Campus Internships Portal</span>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-200/80">{user.name} • {user.role}</span>
            <button onClick={onLogout} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded">
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
