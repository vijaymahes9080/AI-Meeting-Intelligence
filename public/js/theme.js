/**
 * Theme & Visual Customizer Controller
 * Supports Cyber Dark, Neo Glass, and Obsidian Slate palettes
 */

const THEMES = {
  cyber: {
    '--bg-primary': '#07090E',
    '--bg-secondary': '#0F1420',
    '--bg-tertiary': '#161F33',
    '--accent-cyan': '#06B6D4',
    '--accent-purple': '#8B5CF6'
  },
  obsidian: {
    '--bg-primary': '#000000',
    '--bg-secondary': '#0A0A0A',
    '--bg-tertiary': '#141414',
    '--accent-cyan': '#10B981',
    '--accent-purple': '#6366F1'
  },
  neoGlass: {
    '--bg-primary': '#0D1117',
    '--bg-secondary': '#161B22',
    '--bg-tertiary': '#21262D',
    '--accent-cyan': '#58A6FF',
    '--accent-purple': '#BC8CFF'
  }
};

function applyTheme(themeName) {
  const theme = THEMES[themeName] || THEMES.cyber;
  for (const [prop, val] of Object.entries(theme)) {
    document.documentElement.style.setProperty(prop, val);
  }
  localStorage.setItem('ai_meeting_theme', themeName);
}

window.applyTheme = applyTheme;
