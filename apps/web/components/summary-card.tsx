interface SummaryCardProps {
  bmr: number
  totalCalories: number
  hasRecords: boolean
}

export function SummaryCard({ bmr, totalCalories, hasRecords }: SummaryCardProps) {
  const diff = totalCalories - bmr
  const percentage = bmr > 0 ? (totalCalories / bmr) * 100 : 0
  const isOver = diff > 0
  const progressWidth = Math.min(percentage, 100)

  // 기록 없으면 중립 배경, 있으면 상태 반응형
  const bgColor = !hasRecords
    ? 'transparent'
    : isOver
      ? 'rgba(125,0,12,0.05)'
      : 'rgba(27,109,36,0.05)'

  const diffColor = isOver ? 'text-tertiary' : 'text-secondary'
  const progressColor = isOver ? 'bg-tertiary' : 'bg-secondary'
  const diffSign = diff > 0 ? '+' : ''

  const colSeparator: React.CSSProperties = {
    borderLeft: '1px solid rgba(225,227,228,0.2)',
  }

  return (
    <section
      className="rounded-xl p-6 flex flex-col gap-6 shadow-[0_12px_32px_rgba(25,28,29,0.04)]"
      style={{ backgroundColor: bgColor }}
    >
      <div className="grid grid-cols-3 gap-3">
        {/* 기준 */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-label text-[0.6875rem] tracking-wider uppercase text-on-surface-variant font-medium truncate">
            기준
          </span>
          <span className="font-headline text-2xl font-bold text-on-surface leading-tight">
            {bmr.toLocaleString()}
          </span>
          <span className="font-label text-[0.6875rem] text-on-surface-variant">kcal</span>
        </div>

        {/* 섭취 */}
        <div className="flex flex-col gap-1 min-w-0 pl-3" style={colSeparator}>
          <span className="font-label text-[0.6875rem] tracking-wider uppercase text-on-surface-variant font-medium truncate">
            섭취
          </span>
          {hasRecords ? (
            <>
              <span className="font-headline text-2xl font-bold text-on-surface leading-tight">
                {totalCalories.toLocaleString()}
              </span>
              <span className="font-label text-[0.6875rem] text-on-surface-variant">kcal</span>
            </>
          ) : (
            <span className="font-headline text-2xl font-bold text-on-surface-variant/30 leading-tight">
              —
            </span>
          )}
        </div>

        {/* 기준 대비 */}
        <div className="flex flex-col gap-1 min-w-0 pl-3" style={colSeparator}>
          <span className="font-label text-[0.6875rem] tracking-wider uppercase text-on-surface-variant font-medium leading-tight">
            기준 대비
          </span>
          {hasRecords ? (
            <>
              <span className={`font-headline text-2xl font-bold leading-tight ${diffColor}`}>
                {diffSign}{diff.toLocaleString()}
              </span>
              <span className="font-label text-[0.6875rem] text-on-surface-variant">kcal</span>
            </>
          ) : (
            <span className="font-headline text-2xl font-bold text-on-surface-variant/30 leading-tight">
              —
            </span>
          )}
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="flex flex-col gap-1.5">
        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${hasRecords ? progressColor : ''}`}
            style={{ width: hasRecords ? `${progressWidth}%` : '0%' }}
          />
        </div>
        <span className="font-label text-[0.6875rem] text-on-surface-variant">
          {hasRecords ? `기준의 ${percentage.toFixed(1)}% 섭취` : '기록하기 버튼으로 오늘 섭취를 입력하세요'}
        </span>
      </div>
    </section>
  )
}
