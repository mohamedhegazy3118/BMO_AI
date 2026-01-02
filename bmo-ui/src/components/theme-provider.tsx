"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThemeName, ThemeMode, applyTheme, getStoredTheme } from "@/lib/themes";

interface ThemeContextType {
    theme: ThemeName;
    mode: ThemeMode;
    setTheme: (theme: ThemeName) => void;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeName>("catppuccin");
    const [mode, setModeState] = useState<ThemeMode>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = getStoredTheme();
        setThemeState(stored.name);
        setModeState(stored.mode);
        applyTheme(stored.name, stored.mode);
        setMounted(true);
    }, []);

    const setTheme = (newTheme: ThemeName) => {
        setThemeState(newTheme);
        applyTheme(newTheme, mode);
    };

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        applyTheme(theme, newMode);
    };

    const toggleMode = () => {
        const newMode = mode === "dark" ? "light" : "dark";
        setMode(newMode);
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            theme: "catppuccin" as ThemeName,
            mode: "dark" as ThemeMode,
            setTheme: () => { },
            setMode: () => { },
            toggleMode: () => { },
        };
    }
    return context;
}
