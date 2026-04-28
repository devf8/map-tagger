import { useRef, useState } from 'react'
import './SessionGate.css'

export default function SessionGate({ onImport, onCreate }) {
  const inputRef = useRef(null)
  const [step, setStep] = useState('main')
  const [form, setForm] = useState({ title: '', description: '', password: '' })
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try { onImport(JSON.parse(ev.target.result)) }
      catch { alert('Invalid session file.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (step === 'new') {
    return (
      <div className="session-gate">
        <div className="sg-card">
          <h2 className="sg-card-title">New Session</h2>
          <div className="sg-form">
            <label>
              <span>Title</span>
              <input type="text" placeholder="The Kingdom of Terra" value={form.title} onChange={e => set('title', e.target.value)} autoFocus />
            </label>
            <label>
              <span>Description</span>
              <textarea placeholder="Session description…" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
            </label>
            <label>
              <span>Editor Password</span>
              <input type="password" placeholder="Leave blank for no password" value={form.password} onChange={e => set('password', e.target.value)} />
            </label>
          </div>
          <div className="sg-actions">
            <button className="sg-btn ghost" onClick={() => setStep('main')}>Back</button>
            <button className="sg-btn primary" onClick={() => onCreate(form)}>Create</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="session-gate">
      <div className="sg-card">
        <div className="sg-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </div>
        <h1 className="sg-title">Map <span>Tagger</span></h1>
        <p className="sg-sub">An image tagging tool with the GM's best interests in mind.</p>
        <p className="sg-sub">Import a session .json file to begin, or start a new one.</p>
        <div className="sg-actions">
          <button className="sg-btn primary" onClick={() => inputRef.current?.click()}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Import Session
          </button>
          <button className="sg-btn ghost" onClick={() => setStep('new')}>New Session</button>
        </div>
        <p className="sg-sub" style={{ fontSize: '9px' }}>
          Made by F8 for Jod ♥
        </p>
        <input ref={inputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  )
}
