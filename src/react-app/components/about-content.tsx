import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Mail, Github, Linkedin, Twitter } from 'lucide-react'

interface AboutContentProps {
    className?: string
}

export function AboutContent({ className }: AboutContentProps) {
    const { t } = useTranslation()

    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h1 className="text-2xl font-bold">{t('about.content.introduction.title')}</h1>
            </div>
            <ScrollArea className="flex-1">
                <div className="container space-y-8 p-6">
                    {/* Introduction Section */}
                    <section id="introduction">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('about.content.introduction.title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg leading-relaxed">
                                    {t('about.content.introduction.text')}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Skills Section */}
                    <section id="skills">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('about.content.skills.title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">{t('about.content.skills.frontend')}</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>React</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>TypeScript</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>Next.js</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>Tailwind CSS</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">{t('about.content.skills.backend')}</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>Node.js</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>Python</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>Java</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 rounded-lg border">
                                                <span>SQL</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Projects Section */}
                    <section id="projects">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('about.content.projects.title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">
                                            {t('about.content.projects.project1.title')}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {t('about.content.projects.project1.description')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Contact Section */}
                    <section id="contact">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('about.content.contact.title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <Mail className="h-5 w-5" />
                                        <span>{t('about.content.contact.email')}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="icon">
                                                <Github className="h-5 w-5" />
                                            </Button>
                                            <Button variant="outline" size="icon">
                                                <Linkedin className="h-5 w-5" />
                                            </Button>
                                            <Button variant="outline" size="icon">
                                                <Twitter className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </ScrollArea>
        </div>
    )
}
