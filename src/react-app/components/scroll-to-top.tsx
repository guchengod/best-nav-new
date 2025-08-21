import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            // 当页面滚动超过 300px 时显示按钮
            setIsVisible(window.scrollY > 300)
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    if (!isVisible) {
        return null
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <ArrowUp className="h-4 w-4" />
        </Button>
    )
}
