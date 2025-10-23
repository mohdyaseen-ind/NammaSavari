'use client'

import { useState } from 'react'

console.log('Man im reallllll')

export default function TestAuthPage() {
  const [result, setResult] = useState('')

  const testSignup = async () => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        phone: '1234567890',
        role: 'RIDER'
      })
    })
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
  }

  const testLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    })
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
  }

  const testWrongPassword = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpass'
      })
    })
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Testing</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={testSignup} style={{ padding: '10px 20px' }}>
          Test Signup
        </button>
        <button onClick={testLogin} style={{ padding: '10px 20px' }}>
          Test Login
        </button>
        <button onClick={testWrongPassword} style={{ padding: '10px 20px' }}>
          Test Wrong Password
        </button>
      </div>
      <pre style={{ background: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
        {result || 'Click a button to test'}
      </pre>
    </div>
  )
}