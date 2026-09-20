export type DateRule = {
  selectable: boolean
  message?: string
}

const SPECIAL_MESSAGES: Record<string, string> = {
  '2026-09-25':
    'Только если вечером: Юра прилетает днём и сразу в офис!',
  '2026-09-26':
    'Знаю, что будешь в Екабпилсе. Маме мои передавай поздравления!',
  '2026-10-01':
    'Так и так увидимся на игре! Кстати, забираю, как обычно, около 17:45–18:00. Но всегда можно и прогуляться после игры :)',
  '2026-10-10': 'Конечно далековато...',
  '2026-10-11': 'Конечно далековато...',
}

const GENERIC_WEEKDAY_MESSAGE =
  'Всегда можно после рабочего дня пройтись 30 минут по району или поужинать :) Или взять дей офф и реализовать один из планов'

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isWeekday = (isoDate: string) => {
  const day = new Date(`${isoDate}T12:00:00`).getDay()
  return day >= 1 && day <= 5
}

export function getDateRule(isoDate: string, today = new Date()): DateRule {
  if (isoDate < toLocalIsoDate(today)) {
    return { selectable: false }
  }

  if (isoDate === '2026-09-19' || isoDate === '2026-09-20') {
    return { selectable: false }
  }

  if (isoDate >= '2026-09-21' && isoDate <= '2026-09-24') {
    return {
      selectable: false,
      message: 'Юра в Варшаве, надо дождаться!',
    }
  }

  if (isoDate > '2026-10-11') {
    return {
      selectable: false,
      message: 'Успеем ещё до этого, нужна дата пораньше.',
    }
  }

  return {
    selectable: true,
    message: SPECIAL_MESSAGES[isoDate] ?? (isWeekday(isoDate) ? GENERIC_WEEKDAY_MESSAGE : undefined),
  }
}