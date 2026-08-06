import type { ComponentType, ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
}

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: string
  color?: string
  icon?: ComponentType<{ size?: number }>
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return <div className={`page-shell ${className}`.trim()}>{children}</div>
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <div className="section-title page-eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function CardHeader({
  eyebrow,
  title,
  meta,
  actions,
}: {
  eyebrow?: string
  title: string
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="card-header">
      <div>
        {eyebrow && <div className="section-title">{eyebrow}</div>}
        <div className="card-title">{title}</div>
      </div>
      {meta && <div className="card-meta">{meta}</div>}
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, color = 'var(--neon)', icon: Icon }: StatCardProps) {
  return (
    <div className="card stat-card">
      {Icon && (
        <div className="stat-icon" style={{ color }}>
          <Icon size={24} />
        </div>
      )}
      <div className="section-title">{label}</div>
      <div className="stat-number" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}