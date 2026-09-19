export type DateRule = {
  selectable: boolean
  message?: string
}

const SPECIAL_MESSAGES: Record<string, string> = {
  '2026-09-25':
    'Только если вечером: Юра прилетает днём и сразу в офис!',
  '2026-09-26':
    'Закрытие летнего сезона на даче.',
  '2026-10-01':
    'Так и так увидимся на игре! Кстати, забираю, как обычно, около 17:45–18:00. Но всегда можно и прогуляться после игры :)',
}

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

  if (isoDate > '2026-10-04') {
    return {
      selectable: false,
      message: 'Успеем ещё до этого, нужна дата пораньше.',
    }
  }

  return {
    selectable: true,
    message: SPECIAL_MESSAGES[isoDate],
  }
}