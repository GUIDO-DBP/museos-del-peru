export type IconName = "arrow" | "diagonal" | "search" | "map" | "grid" | "pin" | "close" | "menu" | "mountain" | "globe" | "plus" | "minus" | "reset" | "chevron" | "book" | "external"
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    diagonal: <path d="M6 18 18 6M6 6h12v12" />,
    external: (
      <>
        <path d="M14 3h7v7M10 14 21 3" />
        <path d="M10 3H3v18h18v-7" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    map: (
      <>
        <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
        <path d="M9 3v16m6-14v16" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    mountain: (
      <>
        <path d="m2 20 8-15 5 9 3-5 4 11Z" />
        <path d="m7 11 3 2 3-2" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    reset: (
      <>
        <path d="M4 10a8 8 0 1 1 2 8M4 4v6h6" />
      </>
    ),
    chevron: <path d="m8 4 8 8-8 8" />,
    book: (
      <>
        <path d="M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-2-1-6-2-10 1Zm0 0v16" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
export function Mark() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="42"
      height="42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 35V24h10V14h20v10h10v11H33V25H15v10Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M18 41h12M24 2v5M10 7l4 4m24-4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="9" r="2" fill="currentColor" />
    </svg>
  )
}
