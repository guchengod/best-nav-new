import './App.css'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "./components/ui/toaster"

// 懒加载组件
const Layout = lazy(() => import("./components/layout"))

// 加载中组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)

function App() {
  return (
    <BrowserRouter>
        <Toaster />
        <Suspense fallback={<LoadingSpinner />}>
          <Layout/>
        </Suspense>
    </BrowserRouter>
  )
}

export default App
