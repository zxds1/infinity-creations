import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'maridadi.theme';
const modes: ThemeMode[] = ['light', 'dark', 'system'];

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_KEY);
  return modes.includes(stored as ThemeMode) ? stored as ThemeMode : 'system';
}

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? (prefersDark() ? 'dark' : 'light') : mode;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = resolved;
}

export function useThemeMode() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    applyTheme(themeMode);
    window.localStorage.setItem(THEME_KEY, themeMode);

    if (themeMode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  return { themeMode, setThemeMode };
}
