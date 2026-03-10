type PageStateProps = {
  title: string
  description: string
  tone?: 'loading' | 'error' | 'empty'
  actionLabel?: string
  onAction?: () => void
}

const PageState = ({ title, description, tone = 'empty', actionLabel, onAction }: PageStateProps) => (
  <div className={`page-state-card is-${tone}`}>
    <strong>{title}</strong>
    <p>{description}</p>
    {actionLabel && onAction ? (
      <button type="button" className="page-state-action" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null}
  </div>
)

export default PageState
