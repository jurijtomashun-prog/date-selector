import {
  castles,
  foodLabels,
  getMovieLocationLabel,
  labelFor,
  movieLocations,
  movies,
  plans,
} from '../data/content'
import type { InvitationState } from '../types'

const escapeIcs = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

const foldLine = (line: string) => {
  const chunks: string[] = []
  let current = ''
  for (const character of line) {
    if (new TextEncoder().encode(current + character).length > 73) {
      chunks.push(current)
      current = ` ${character}`
    } else {
      current += character
    }
  }
  chunks.push(current)
  return chunks.join('\r\n')
}

export function describeInvitation(state: InvitationState) {
  const lines = [
    `Персонаж: ${state.character}`,
    `План: ${labelFor(plans, state.plan)}`,
  ]

  if (state.castle) lines.push(`Куда едем: ${labelFor(castles, state.castle)}`)
  if (state.movieLocation) {
    const location = movieLocations.find((item) => item.id === state.movieLocation)
    const place = location ? getMovieLocationLabel(location, state.character) : ''
    lines.push(`Где смотрим: ${place}`)
  }
  if (state.movie) lines.push(`Кино: ${labelFor(movies, state.movie)}`)
  if (state.plan === 'movie') lines.push('Напиток: Аперольчик')
  if (state.food) {
    const food = state.food === 'custom' ? state.customFood : foodLabels[state.food]
    lines.push(`Навернуть бы: ${food}`)
  }
  if (state.plan === 'gastro') lines.push('Еда: входит в гастро-тур')

  return lines.join('\n')
}

export function createCalendarEvent(state: InvitationState) {
  if (!state.date) throw new Error('Для календаря нужна дата')
  const date = state.date.replaceAll('-', '')
  const next = new Date(`${state.date}T12:00:00`)
  next.setDate(next.getDate() + 1)
  const endDate = [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, '0'),
    String(next.getDate()).padStart(2, '0'),
  ].join('')
  const uid = `svidanka-${date}@date-selector`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Date Selector//Svidanka//RU',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${endDate}`,
    'SUMMARY:Свиданка с Юрой',
    `DESCRIPTION:${escapeIcs(describeInvitation(state))}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ]
    .map(foldLine)
    .join('\r\n')
}