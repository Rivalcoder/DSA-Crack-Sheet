"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className="theme-toggle-icon">
                {isDark ? (
                    <Sun size={20} strokeWidth={2.5} />
                ) : (
                    <Moon size={20} strokeWidth={2.5} />
                )}
            </div>
        </button>
    );
}

