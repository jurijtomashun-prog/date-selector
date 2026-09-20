import { useEffect, useState } from 'react'
import {
  initialInvitationState,
  type InvitationState,
} from '../types'

const STORAGE_KEY = 'date-selector:v1'

const allowed = {
  character: ['Татьяна', 'Таня', 'Танюха'],
  plan: ['trip', 'party', 'movie', 'karaoke', 'gastro', 'custom'],
  castle: ['jaunmoku', 'rundale', 'birini', 'daugavpils'],
  movieLocation: ['hers', 'yura', 'car'],
  movie: ['snatch', 'scary-movie', 'dont-menace', 'eurotrip'],
  food: [
    'jaunmoku-place',
    'bauska-place',
    'parking-sandwiches',
    'big-tasty',
    'before-party',
    'solar-energy',
    'sushi',
    'pasta',
    'pizza',
    'custom',
  ],
} as const

const isNullableAllowed = (value: unknown, values: readonly string[]) =>
  value === null || (typeof value === 'string' && values.includes(value))

function restoreState(): InvitationState {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (
      !value ||
      !isNullableAllowed(value.character, allowed.character) ||
      typeof value.consented !== 'boolean' ||
      !(value.date === null || /^2026-(09|10)-\d{2}$/.test(value.date)) ||
      !isNullableAllowed(value.plan, allowed.plan) ||
      !isNullableAllowed(value.castle, allowed.castle) ||
      !isNullableAllowed(value.movieLocation, allowed.movieLocation) ||
      !isNullableAllowed(value.movie, allowed.movie) ||
      !isNullableAllowed(value.food, allowed.food) ||
      typeof value.customFood !== 'string' ||
      typeof value.customPlanText !== 'string'
    ) {
      return initialInvitationState
    }
    return value as InvitationState
  } catch {
    return initialInvitationState
  }
}

export function usePersistedInvitation() {
  const [state, setState] = useState<InvitationState>(restoreState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const update = (changes: Partial<InvitationState>) => {
    setState((current) => ({ ...current, ...changes }))
  }

  const reset = () => setState(initialInvitationState)

  return { state, update, reset }
}