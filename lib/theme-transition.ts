export function toggleThemeWithTransition(
  event: React.MouseEvent<HTMLElement>,
  setTheme: (theme: string) => void,
  currentTheme: string | undefined
) {
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  if (!document.startViewTransition) {
    setTheme(newTheme)
    return
  }

  document.startViewTransition(() => {
    setTheme(newTheme)
  })
}

