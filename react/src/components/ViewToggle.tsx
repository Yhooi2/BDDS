import type { ViewMode } from '../types'

const VIEW_LABELS: Record<ViewMode, string> = {
  details: 'Детали за текущий год',
  dynamics: 'Динамика по годам',
}

interface ViewToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
  className?: string
}

export function ViewToggle({ mode, onModeChange, className = '' }: ViewToggleProps) {
  const nextMode: ViewMode = mode === 'details' ? 'dynamics' : 'details'

  return (
    <button
      className={`view-toggle ${className}`}
      onClick={() => onModeChange(nextMode)}
    >
      {VIEW_LABELS[nextMode]}
      <span className="view-toggle__arrow" />
    </button>
  )
}
