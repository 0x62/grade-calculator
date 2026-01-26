import { Badge } from './catalyst/badge'
import type { StatusTone } from './grade-utils'
import { statusMeta } from './grade-utils'

export function StatusBadge({ status, label }: { status: StatusTone; label?: string }) {
  const meta = statusMeta[status]
  return <Badge color={meta.badgeColor}>{label ?? meta.label}</Badge>
}
