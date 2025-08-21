import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl';

const breakpoints = {
    'sm': 640,
    'md': 768,
    'lg': 1024,
    'xl': 1280,
    '2xl': 1400,
    '3xl': 1600,
    '4xl': 1800,
    '5xl': 2400,
    '6xl': 3000,
    '7xl': 3600,
    '8xl': 4200,
    '9xl': 4800,
    '10xl': 5400,
};

export function useBreakpoint(): Breakpoint {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= breakpoints['10xl']) {
                setBreakpoint('10xl');
            } else if (width >= breakpoints['9xl']) {
                setBreakpoint('9xl');
            } else if (width >= breakpoints['8xl']) {
                setBreakpoint('8xl');
            } else if (width >= breakpoints['7xl']) {
                setBreakpoint('7xl');
            } else if (width >= breakpoints['6xl']) {
                setBreakpoint('6xl');
            } else if (width >= breakpoints['5xl']) {
                setBreakpoint('5xl');
            } else if (width >= breakpoints['4xl']) {
                setBreakpoint('4xl');
            } else if (width >= breakpoints['3xl']) {
                setBreakpoint('3xl');
            } else if (width >= breakpoints['2xl']) {
                setBreakpoint('2xl');
            } else if (width >= breakpoints.xl) {
                setBreakpoint('xl');
            } else if (width >= breakpoints.lg) {
                setBreakpoint('lg');
            } else if (width >= breakpoints.md) {
                setBreakpoint('md');
            } else if (width >= breakpoints.sm) {
                setBreakpoint('sm');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return breakpoint;
}
