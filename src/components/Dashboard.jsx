import { useEffect, useMemo, useState } from 'react'

function Badge({ children }) {
  return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-200 border border-blue-400/30">{children}</span>
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [openings, setOpenings] = useState([])
  const [applications, setApplications] = useState([])
  const [form, setForm] = useState({ title: '', company: '', department: '', skills_required: '', stipend_min: '', stipend_max: '' })

  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  useEffect(() => {
    const u = localStorage.getItem('currentUser')
    if (u) setUser(JSON.parse(u))
  }, [])

  useEffect(() => {
    fetchOpenings()
  }, [])

  const fetchOpenings = async () => {
    const res = await fetch(`${baseUrl}/openings`)
    const data = await res.json()
    setOpenings(data)
  }

  const fetchApplications = async () => {
    if (!user) return
    const res = await fetch(`${baseUrl}/applications?student_id=${user.id}`)
    const data = await res.json()
    setApplications(data)
  }

  useEffect(() => { fetchApplications() }, [user])

  const apply = async (openingId) => {
    if (!user) return
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: user.id, opening_id: openingId, status: 'applied' })
    })
    if (res.ok) fetchApplications()
  }

  const createOpening = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      company: form.company,
      department: form.department || null,
      description: null,
      skills_required: form.skills_required.split(',').map(s => s.trim()).filter(Boolean),
      stipend_min: form.stipend_min ? Number(form.stipend_min) : null,
      stipend_max: form.stipend_max ? Number(form.stipend_max) : null,
      placement_conversion_prob: 0,
      deadline: null,
      created_by: user?.id || null,
    }
    const res = await fetch(`${baseUrl}/openings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setForm({ title: '', company: '', department: '', skills_required: '', stipend_min: '', stipend_max: '' })
      fetchOpenings()
    }
  }

  const myApplicationsSet = new Set(applications.map(a => a.opening_id))

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <div className="text-blue-200/70 text-sm">Openings</div>
          <div className="text-3xl text-white font-semibold">{openings.length}</div>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <div className="text-blue-200/70 text-sm">My Applications</div>
          <div className="text-3xl text-white font-semibold">{applications.length}</div>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <div className="text-blue-200/70 text-sm">Role</div>
          <div className="text-3xl text-white font-semibold">{user?.role || '-'}</div>
        </div>
      </div>

      {/* Openings list */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Openings</h3>
          {user?.role === 'placement' && (
            <details className="w-full md:w-auto">
              <summary className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded">Post Opening</summary>
              <form onSubmit={createOpening} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/50 p-3 rounded">
                <input placeholder="Title" className="bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} required />
                <input placeholder="Company" className="bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" value={form.company} onChange={e=>setForm(f=>({...f, company:e.target.value}))} required />
                <input placeholder="Department" className="bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" value={form.department} onChange={e=>setForm(f=>({...f, department:e.target.value}))} />
                <input placeholder="Skills (comma separated)" className="bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white md:col-span-2" value={form.skills_required} onChange={e=>setForm(f=>({...f, skills_required:e.target.value}))} />
                <input type="number" placeholder="Stipend Min" className="bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" value={form.stipend_min} onChange={e=>setForm(f=>({...f, stipend_min:e.target.value}))} />
                <input type="number" placeholder="Stipend Max" className="bg-slate-900/70 border border-white/10 rounded px-3 py-2 text-white" value={form.stipend_max} onChange={e=>setForm(f=>({...f, stipend_max:e.target.value}))} />
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded md:col-span-3">Create</button>
              </form>
            </details>
          )}
        </div>

        <div className="grid gap-3">
          {openings.map(o => (
            <div key={o.id} className="bg-slate-900/40 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">{o.title} • {o.company}</h4>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {o.skills_required?.map(s => <Badge key={s}>{s}</Badge>)}
                  </div>
                </div>
                {user?.role === 'student' && (
                  <button disabled={myApplicationsSet.has(o.id)} onClick={() => apply(o.id)} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded">
                    {myApplicationsSet.has(o.id) ? 'Applied' : 'Apply'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applications list (for student) */}
      {user?.role === 'student' && (
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">My Applications</h3>
          <div className="grid gap-3">
            {applications.map(a => (
              <div key={a.id} className="bg-slate-900/40 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                <div className="text-blue-200/80 text-sm">{a.opening_id}</div>
                <Badge>{a.status}</Badge>
              </div>
            ))}
            {applications.length === 0 && <p className="text-blue-200/60 text-sm">No applications yet.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
