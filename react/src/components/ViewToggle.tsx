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
  const arrowDirection = mode === 'dynamics' ? 'left' : 'right'

  return (
    <button
      className={`view-toggle view-toggle--${arrowDirection} ${className}`}
      onClick={() => onModeChange(nextMode)}
    >
      {arrowDirection === 'left' && <span className="view-toggle__arrow" />}
      {VIEW_LABELS[mode]}
      {arrowDirection === 'right' && <span className="view-toggle__arrow" />}
    </button>
  )
}
