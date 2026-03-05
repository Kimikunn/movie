type StatCardProps = {
  title: string
  value: string
  description: string
  inverse?: boolean
}

const StatCard = ({ title, value, description, inverse = false }: StatCardProps) => {
  return (
    <article className={`stat-card ${inverse ? 'is-inverse' : ''}`.trim()}>
      <p className="stat-card__title">{title}</p>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__desc">{description}</p>
    </article>
  )
}

export default StatCard
