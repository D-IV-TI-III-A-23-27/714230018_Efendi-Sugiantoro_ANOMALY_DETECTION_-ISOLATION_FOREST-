/**
 * AI Core - Theme Management logic
 * Handles Light, Dark, and System modes
 */

(function() {
    const theme = localStorage.getItem('theme') || 'system';
    applyTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('theme') === 'system') {
            applyTheme('system');
        }
    });
})();

function applyTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    
    // Update active icon in UI
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        updateThemeUI(theme);
    } else {
        document.addEventListener('DOMContentLoaded', () => updateThemeUI(theme));
    }
}

function updateThemeUI(theme) {
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
        if (btn.getAttribute('data-theme-btn') === theme) {
            btn.classList.add('bg-sky-500', 'text-white', 'shadow-lg', 'shadow-sky-500/20');
            btn.classList.remove('text-slate-500', 'dark:text-slate-400');
        } else {
            btn.classList.remove('bg-sky-500', 'text-white', 'shadow-lg', 'shadow-sky-500/20');
            btn.classList.add('text-slate-500', 'dark:text-slate-400');
        }
    });
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    
    // Trigger canvas redraw if on simulation tab
    if (window.initCanvas) {
        window.initCanvas();
    }
}

// Export to window
window.setTheme = setTheme;
window.updateThemeUI = updateThemeUI;

