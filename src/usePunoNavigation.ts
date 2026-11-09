import { useSyncExternalStore } from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  return () => window.removeEventListener("popstate", onChange)
}

export function useLocationSearch() {
  return useSyncExternalStore(subscribe, () => location.search, () => "")
}

export function navigateLocal(href: string, state: Record<string, unknown> = {}) {
  history.pushState(state, "", href)
  window.dispatchEvent(new PopStateEvent("popstate"))
}
