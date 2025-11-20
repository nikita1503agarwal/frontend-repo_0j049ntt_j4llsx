import { useState } from 'react'

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'mentor', label: 'Faculty Mentor' },
  { value: 'placement', label: 'Placement Cell' },
  { value: 'recruiter', label: 'Recruiter' },
]

export default function Auth({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'student', department: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      // Try to find existing user by email
      const existing = await fetch(`${baseUrl}/users?email=${encodeURIComponent(form.email)}`)
      if (existing.ok) {
        const users = await existing.json()
        if (users.length > 0) {
          localStorage.setItem('currentUser', JSON.stringify(users[0]))
          onLogin(users[0])
          setLoading(false)
          return
        }
      }
      // Create new user
      const res = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          department: form.department,
          skills: [],
          resume_url: null,
          is_active: true,
        }),
      })
      if (!res.ok) throw new Error('Failed to create user')
      const { id } = await res.json()
      const userObj = { id, ...form }
      localStorage.setItem('currentUser', JSON.stringify(userObj))
      onLogin(userObj)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6">
      <h2 className="text-white text-xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-blue-200/80 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-blue-200/80 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-blue-200/80 mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white">
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-blue-200/80 mb-1">Department</label>
            <input name="department" value={form.department} onChange={handleChange} className="w-full bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
