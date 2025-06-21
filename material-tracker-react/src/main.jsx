import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast' // NEW: Import Toaster
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx' // NEW: Import ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* NEW: Wrap App with ThemeProvider */}
        <App />
      </ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} /> {/* NEW: Add Toaster component */}
    </BrowserRouter>
  </React.StrictMode>,
)