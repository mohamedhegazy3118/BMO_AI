// ═══════════════════════════════════════════════════════════════════════════
// BMO Theme Engine - 6 Popular Developer Themes with Light/Dark Modes
// ═══════════════════════════════════════════════════════════════════════════

export type ThemeName = "catppuccin" | "dracula" | "nord" | "gruvbox" | "solarized" | "monokai";
export type ThemeMode = "dark" | "light";

export interface ThemePalette {
    bg: string;
    bgSecondary: string;
    bgChat: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    border: string;
    success: string;
    error: string;
}

export interface ThemeConfig {
    name: ThemeName;
    label: string;
    icon: string;
    dark: ThemePalette;
    light: ThemePalette;
}

export const themes: Record<ThemeName, ThemeConfig> = {
    catppuccin: {
        name: "catppuccin",
        label: "Catppuccin",
        icon: "🐱",
        dark: {
            bg: "#1e1e2e",
            bgSecondary: "#181825",
            bgChat: "#313244",
            text: "#cdd6f4",
            textSecondary: "#a6adc8",
            accent: "#cba6f7",
            accentHover: "#b4befe",
            border: "rgba(205, 214, 244, 0.1)",
            success: "#a6e3a1",
            error: "#f38ba8",
        },
        light: {
            bg: "#eff1f5",
            bgSecondary: "#e6e9ef",
            bgChat: "#dce0e8",
            text: "#4c4f69",
            textSecondary: "#6c6f85",
            accent: "#8839ef",
            accentHover: "#7c3aed",
            border: "rgba(76, 79, 105, 0.1)",
            success: "#40a02b",
            error: "#d20f39",
        },
    },
    dracula: {
        name: "dracula",
        label: "Dracula",
        icon: "🧛",
        dark: {
            bg: "#282a36",
            bgSecondary: "#21222c",
            bgChat: "#44475a",
            text: "#f8f8f2",
            textSecondary: "#6272a4",
            accent: "#ff79c6",
            accentHover: "#ff92d0",
            border: "rgba(248, 248, 242, 0.1)",
            success: "#50fa7b",
            error: "#ff5555",
        },
        light: {
            bg: "#f8f8f2",
            bgSecondary: "#ffffff",
            bgChat: "#e8e8e2",
            text: "#282a36",
            textSecondary: "#6272a4",
            accent: "#ff79c6",
            accentHover: "#ff5fbd",
            border: "rgba(40, 42, 54, 0.1)",
            success: "#50fa7b",
            error: "#ff5555",
        },
    },
    nord: {
        name: "nord",
        label: "Nord",
        icon: "❄️",
        dark: {
            bg: "#2e3440",
            bgSecondary: "#242933",
            bgChat: "#3b4252",
            text: "#eceff4",
            textSecondary: "#d8dee9",
            accent: "#88c0d0",
            accentHover: "#8fbcbb",
            border: "rgba(236, 239, 244, 0.1)",
            success: "#a3be8c",
            error: "#bf616a",
        },
        light: {
            bg: "#eceff4",
            bgSecondary: "#ffffff",
            bgChat: "#e5e9f0",
            text: "#2e3440",
            textSecondary: "#4c566a",
            accent: "#5e81ac",
            accentHover: "#81a1c1",
            border: "rgba(46, 52, 64, 0.1)",
            success: "#a3be8c",
            error: "#bf616a",
        },
    },
    gruvbox: {
        name: "gruvbox",
        label: "Gruvbox",
        icon: "🌾",
        dark: {
            bg: "#282828",
            bgSecondary: "#1d2021",
            bgChat: "#3c3836",
            text: "#ebdbb2",
            textSecondary: "#a89984",
            accent: "#d79921",
            accentHover: "#fabd2f",
            border: "rgba(235, 219, 178, 0.1)",
            success: "#98971a",
            error: "#cc241d",
        },
        light: {
            bg: "#fbf1c7",
            bgSecondary: "#ffffff",
            bgChat: "#f2e5bc",
            text: "#3c3836",
            textSecondary: "#7c6f64",
            accent: "#d65d0e",
            accentHover: "#af3a03",
            border: "rgba(60, 56, 54, 0.1)",
            success: "#79740e",
            error: "#9d0006",
        },
    },
    solarized: {
        name: "solarized",
        label: "Solarized",
        icon: "☀️",
        dark: {
            bg: "#002b36",
            bgSecondary: "#001e26",
            bgChat: "#073642",
            text: "#839496",
            textSecondary: "#657b83",
            accent: "#2aa198",
            accentHover: "#268bd2",
            border: "rgba(131, 148, 150, 0.1)",
            success: "#859900",
            error: "#dc322f",
        },
        light: {
            bg: "#fdf6e3",
            bgSecondary: "#ffffff",
            bgChat: "#eee8d5",
            text: "#657b83",
            textSecondary: "#93a1a1",
            accent: "#d33682",
            accentHover: "#cb4b16",
            border: "rgba(101, 123, 131, 0.1)",
            success: "#859900",
            error: "#dc322f",
        },
    },
    monokai: {
        name: "monokai",
        label: "Monokai",
        icon: "🎨",
        dark: {
            bg: "#272822",
            bgSecondary: "#1e1f1c",
            bgChat: "#3e3d32",
            text: "#f8f8f2",
            textSecondary: "#75715e",
            accent: "#f92672",
            accentHover: "#fd5ff0",
            border: "rgba(248, 248, 242, 0.1)",
            success: "#a6e22e",
            error: "#f92672",
        },
        light: {
            bg: "#fafafa",
            bgSecondary: "#ffffff",
            bgChat: "#f0f0f0",
            text: "#272822",
            textSecondary: "#75715e",
            accent: "#f92672",
            accentHover: "#fd5ff0",
            border: "rgba(39, 40, 34, 0.1)",
            success: "#a6e22e",
            error: "#f92672",
        },
    },
};

export const themeNames = Object.keys(themes) as ThemeName[];

function isValidTheme(name: string): name is ThemeName {
    return themeNames.includes(name as ThemeName);
}

function isValidMode(mode: string): mode is ThemeMode {
    return mode === "dark" || mode === "light";
}

export function getThemePalette(name: ThemeName, mode: ThemeMode): ThemePalette {
    const theme = themes[name] ?? themes.catppuccin;
    return theme[mode] ?? theme.dark;
}

export function applyTheme(name: ThemeName, mode: ThemeMode): void {
    const palette = getThemePalette(name, mode);
    const root = document.documentElement;

    root.style.setProperty("--bg", palette.bg);
    root.style.setProperty("--bg-secondary", palette.bgSecondary);
    root.style.setProperty("--bg-chat", palette.bgChat);
    root.style.setProperty("--text", palette.text);
    root.style.setProperty("--text-secondary", palette.textSecondary);
    root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--accent-hover", palette.accentHover);
    root.style.setProperty("--border", palette.border);
    root.style.setProperty("--success", palette.success);
    root.style.setProperty("--error", palette.error);

    localStorage.setItem("bmo-theme", name);
    localStorage.setItem("bmo-mode", mode);
}

export function getStoredTheme(): { name: ThemeName; mode: ThemeMode } {
    if (typeof window === "undefined") {
        return { name: "catppuccin", mode: "dark" };
    }
    const storedName = localStorage.getItem("bmo-theme") ?? "";
    const storedMode = localStorage.getItem("bmo-mode") ?? "";
    return {
        name: isValidTheme(storedName) ? storedName : "catppuccin",
        mode: isValidMode(storedMode) ? storedMode : "dark",
    };
}
