import { useState, useEffect } from 'react';

/**
 * Custom hook for mobile view detection
 * @param {number} breakpoint - Screen width threshold for mobile detection (default: 768px)
 * @returns {boolean} isMobile - True if screen width is below breakpoint
 */
export const useMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= breakpoint);
        };

        // Initial check
        checkScreenSize();

        // Add resize listener
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, [breakpoint]);

    return isMobile;
};
