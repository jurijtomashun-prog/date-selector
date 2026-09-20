import { describe, expect, it } from 'vitest'
import { getDateRule } from './dateRules'

const today = new Date(2026, 8, 19, 12)

describe('getDateRule', () => {
  it('blocks past dates and September 19–20', () => {
    expect(getDateRule('2026-09-18', today).selectable).toBe(false)
    expect(getDateRule('2026-09-19', today).selectable).toBe(false)
    expect(getDateRule('2026-09-20', today).selectable).toBe(false)
  })

  it('blocks the Warsaw dates with their explanation', () => {
    expect(getDateRule('2026-09-21', today)).toEqual({
      selectable: false,
      message: 'Юра в Варшаве, надо дождаться!',
    })
    expect(getDateRule('2026-09-24', today).selectable).toBe(false)
  })

  it('allows contextual dates and blocks dates after October 11', () => {
    expect(getDateRule('2026-09-25', today).selectable).toBe(true)
    expect(getDateRule('2026-09-26', today).message).toContain('Екабпилсе')
    expect(getDateRule('2026-10-01', today).message).toContain('увидимся на игре')
    expect(getDateRule('2026-10-10', today)).toEqual({
      selectable: true,
      message: 'Конечно далековато...',
    })
    expect(getDateRule('2026-10-11', today).selectable).toBe(true)
    expect(getDateRule('2026-10-12', today)).toEqual({
      selectable: false,
      message: 'Успеем ещё до этого, нужна дата пораньше.',
    })
  })

  it('adds a generic note on ordinary weekdays without a special message', () => {
    const weekdayIso = '2026-09-28'
    const isWeekday = [1, 2, 3, 4, 5].includes(new Date(`${weekdayIso}T12:00:00`).getDay())
    const rule = getDateRule(weekdayIso, today)

    expect(rule.selectable).toBe(true)
    if (isWeekday) {
      expect(rule.message).toContain('после рабочего дня')
    } else {
      expect(rule.message).toBeUndefined()
    }
  })
})