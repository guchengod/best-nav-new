import { cn } from "@/lib/utils"

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    children: React.ReactNode
}

export function Link({ href, children, className, ...props }: LinkProps) {
    return (
        <a
            href={href}
            className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                className
            )}
            {...props}
        >
            {children}
        </a>
    )
}
