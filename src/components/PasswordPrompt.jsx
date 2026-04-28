import { useState, useCallback } from 'react'
import './PasswordPrompt.css'

export default function PasswordPrompt({ onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = useCallback(() => {
    const ok = onConfirm(input)
    if (ok === false) setError('Incorrect password')
  }, [input, onConfirm])

  return (
    <div className="pp-overlay">
      <div className="pp-modal">
        <div className="pp-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3>Editor Access</h3>
        <p>For the GM's eyes only!</p>
        <p>Enter the password to access editing tools</p>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          autoFocus
          placeholder="Password"
          className={error ? 'pp-input-error' : ''}
        />
        {error && <span className="pp-error">{error}</span>}
        <div className="pp-actions">
          <button className="pp-btn ghost" onClick={onCancel}>Cancel</button>
          <button className="pp-btn primary" onClick={handleConfirm}>Unlock</button>
        </div>
      </div>
    </div>
  )
}
