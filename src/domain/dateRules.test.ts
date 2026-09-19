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

  it('allows contextual dates and blocks dates after October 4', () => {
    expect(getDateRule('2026-09-25', today).selectable).toBe(true)
    expect(getDateRule('2026-09-26', today).message).toBe(
      'Закрытие летнего сезона на даче.',
    )
    expect(getDateRule('2026-10-01', today).message).toContain('увидимся на игре')
    expect(getDateRule('2026-10-04', today).selectable).toBe(true)
    expect(getDateRule('2026-10-05', today)).toEqual({
      selectable: false,
      message: 'Успеем ещё до этого, нужна дата пораньше.',
    })
  })
})