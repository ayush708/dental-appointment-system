import ReactDOM from 'react-dom/client'

// Simple test component
const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#3b82f6' }}>🦷 Dental System Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', marginTop: '20px' }}>
        <strong>Status:</strong> Frontend is loading correctly
      </div>
    </div>
  )
}

// Render the test app
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<TestApp />)
