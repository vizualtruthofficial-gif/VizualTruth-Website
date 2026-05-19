(function () {
  const themeKey = "vizualtruth-theme";
  const toggles = Array.from(document.querySelectorAll("[data-theme-toggle]"));

  function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }

  function getSavedTheme() {
    try {
      return window.localStorage.getItem(themeKey);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(themeKey, theme);
    } catch (error) {
      return;
    }
  }

  const savedTheme = getSavedTheme();
  applyTheme(savedTheme === "dark" ? "dark" : "light");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      saveTheme(nextTheme);
      applyTheme(nextTheme);
    });
  });
})();
