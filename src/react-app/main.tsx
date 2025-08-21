import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./components/theme-provider"
import './i18n'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme="light" storageKey="best-nav-theme">
          <App />
        </ThemeProvider>
      </I18nextProvider>
    </React.StrictMode>
  )
}
