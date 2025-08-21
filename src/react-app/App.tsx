import './App.css'
import { NavigationProvider } from "./context/navigation-context"
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "./components/ui/toaster"

// 懒加载组件
const Layout = lazy(() => import("./components/layout"))
const Content = lazy(() => import("./components/content"))

// 加载中组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <Toaster />
        <Suspense fallback={<LoadingSpinner />}>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Content />
            </Suspense>
          </Layout>
        </Suspense>
      </NavigationProvider>
    </BrowserRouter>
  )
}

export default App
