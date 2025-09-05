import { Search } from "lucide-react";
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, type Website } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSearchParams } from 'react-router-dom';
import { useBreakpoint } from "../hooks/use-breakpoint";

const Content = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [sites, setSites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const [isChanging, setIsChanging] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const breakpoint = useBreakpoint();

    const getPageSize = () => {
        switch (breakpoint) {
            case '10xl': return 48;
            case '9xl': return 45;
            case '8xl': return 42;
            case '7xl': return 39;
            case '6xl': return 36;
            case '5xl': return 33;
            case '4xl': return 30;
            case '3xl': return 27;
            case '2xl': return 24;
            case 'xl': return 20;
            case 'lg': return 16;
            case 'md': return 12;
            case 'sm': return 8;
            default: return 4;
        }
    };

    const pageSize = getPageSize();

    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (loading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, isFetchingMore]);

    // 获取 URL 参数
    const menuId = searchParams.get('menuId');

    useEffect(() => {
        setIsChanging(true);
        setTimeout(() => setIsChanging(false), 300);
    }, [menuId]);

    const loadWebsites = async (currentPage: number, isLoadingMore = false) => {
        if (!isLoadingMore) {
            setLoading(true);
            setSites([]);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const params = new URLSearchParams();
            if (menuId) params.append('menuId', menuId);
            if (searchQuery) params.append('search', searchQuery);
            params.append('page', currentPage.toString());
            params.append('pageSize', pageSize.toString());

            const response = await api.getWebsites(params.toString());
            const { data, pagination } = response;

            if (currentPage === 1) {
                setSites(data);
            } else {
                setSites(prev => [...prev, ...data]);
            }
            const paginations = pagination ?? { totalPages: 0 };

            setHasMore(currentPage < paginations.totalPages);
            setError(null);
        } catch (error) {
            console.error('Failed to load websites:', error);
            setError('Failed to load websites');
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        loadWebsites(1);
    }, [menuId, searchQuery, pageSize]);

    useEffect(() => {
        if (page > 1) {
            loadWebsites(page, true);
        }
    }, [page]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className=" overflow-auto w-full">
            <div className="container mx-auto">
                <div className="w-full">
                    <div className="flex justify-center mb-6">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('content.searchPlaceholder')}
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={cn(
                        "transition-opacity duration-300",
                        isChanging ? "opacity-0" : "opacity-100"
                    )}>
                        <AnimatePresence mode="popLayout">
                            {loading && !isFetchingMore ? (
                                <div className="w-full flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 5xl:grid-cols-9 6xl:grid-cols-10 7xl:grid-cols-11 8xl:grid-cols-12 9xl:grid-cols-13 10xl:grid-cols-14 gap-4">
                                    {sites.map((site, index) => (
                                        <motion.a
                                            key={site.id}
                                            ref={index === sites.length - 1 ? lastElementRef : null}
                                            href={site.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col h-28 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-card hover:bg-accent/5"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <img src={site.icon} alt={site.name} className="w-6 h-6" loading="lazy" />
                                                <span className="text-sm font-medium truncate flex-1">{site.name}</span>
                                                <span className={`w-2 h-2 rounded-full ${site.alive ? 'bg-green-500' : 'bg-red-500'}`} />
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{site.description}</p>
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {site.tags.slice(0, 3).map((tag) => (
                                                    <span 
                                                        key={tag.id} 
                                                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                                                        style={{
                                                            backgroundColor: `${tag.color}20`,
                                                            color: tag.color
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {site.tags.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        +{site.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            )}
                            {isFetchingMore && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full flex justify-center py-4"
                                >
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                </motion.div>
                            )}
                            {!hasMore && sites.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full flex justify-center py-6"
                                >
                                    <div className="w-16 h-0.5 bg-muted" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Content;