import { describe, expect, it } from 'vitest'
import { getFoodOptions } from '../data/content'
import type { InvitationState } from '../types'
import { createCalendarEvent } from './createCalendarEvent'

const state: InvitationState = {
  character: 'Танюха',
  consented: true,
  date: '2026-09-25',
  plan: 'movie',
  castle: null,
  movieLocation: 'hers',
  movie: 'eurotrip',
  food: 'custom',
  customFood: 'Хачапури, лимонад и торт',
}

describe('createCalendarEvent', () => {
  it('creates an all-day event with every selected detail', () => {
    const result = createCalendarEvent(state)

    expect(result).toContain('DTSTART;VALUE=DATE:20260925')
    expect(result).toContain('DTEND;VALUE=DATE:20260926')
    expect(result).toContain('SUMMARY:Свиданка с Юрой')
    expect(result).toContain('Танюха')
    expect(result).toContain('Евротур')
    expect(result).toContain('Аперольчик')
    expect(result).toContain('Хачапури')
  })

  it('offers food appropriate to the selected branch', () => {
    expect(getFoodOptions('trip', 'jaunmoku')).toEqual([
      'jaunmoku-place',
      'parking-sandwiches',
    ])
    expect(getFoodOptions('trip', 'birini')).toEqual(['parking-sandwiches'])
    expect(getFoodOptions('gastro', null)).toEqual([])
  })
})