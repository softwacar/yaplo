import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
  position="top-center"
  toastOptions={{
    duration: 3000,
    style: {
      background: '#1e293b',
      color: '#f8fafc',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
    },
    success: {
      iconTheme: {
        primary: '#3b82f6',
        secondary: '#f8fafc',
      },
    },
    error: {
      position: 'bottom-right',
      iconTheme: {
        primary: '#ef4444',
        secondary: '#f8fafc',
      },
    },
  }}
/>
  </StrictMode>,
)