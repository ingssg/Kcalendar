interface SummaryCardProps {
  bmr: number
  totalCalories: number
}

export function SummaryCard({ bmr, totalCalories }: SummaryCardProps) {
  const diff = totalCalories - bmr
  const percentage = bmr > 0 ? (totalCalories / bmr) * 100 : 0
  const isOver = diff > 0
  const progressWidth = Math.min(percentage, 100)

  const bgColor = isOver ? 'rgba(125,0,12,0.05)' : 'rgba(27,109,36,0.05)'
  const diffColor = isOver ? 'text-tertiary' : 'text-secondary'
  const progressColor = isOver ? 'bg-tertiary' : 'bg-secondary'
  const diffSign = diff > 0 ? '+' : ''

  return (
    <section
      className="rounded-xl p-6 flex flex-col gap-6 shadow-[0_12px_32px_rgba(25,28,29,0.04)]"
      style={{ backgroundColor: bgColor }}
    >
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 items-start">
          <span className="font-label text-[0.6875rem] tracking-widest uppercase text-on-surface-variant font-medium">
            기준
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-3xl font-bold text-on-surface">
              {bmr.toLocaleString()}
            </span>
            <span className="font-label text-[0.6875rem] text-on-surface-variant">kcal</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-start pl-4" style={{ borderLeft: '1px solid rgba(225,227,228,0.2)' }}>
          <span className="font-label text-[0.6875rem] tracking-widest uppercase text-on-surface-variant font-medium">
            섭취
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-3xl font-bold text-on-surface">
              {totalCalories.toLocaleString()}
            </span>
            <span className="font-label text-[0.6875rem] text-on-surface-variant">kcal</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-start pl-4" style={{ borderLeft: '1px solid rgba(225,227,228,0.2)' }}>
          <span className="font-label text-[0.6875rem] tracking-widest uppercase text-on-surface-variant font-medium">
            기준 대비
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`font-headline text-3xl font-bold ${diffColor}`}>
              {diffSign}{diff.toLocaleString()}
            </span>
            <span className="font-label text-[0.6875rem] text-on-surface-variant">kcal</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progressColor} transition-all duration-200`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <span className="font-label text-[0.6875rem] text-on-surface-variant">
          기준의 {percentage.toFixed(1)}% 섭취
        </span>
      </div>
    </section>
  )
}
