export type CharacterName = 'Татьяна' | 'Таня' | 'Танюха'

export type PlanId = 'trip' | 'party' | 'movie' | 'karaoke' | 'gastro' | 'custom'
export type CastleId = 'jaunmoku' | 'rundale' | 'birini' | 'daugavpils'
export type MovieLocationId = 'hers' | 'yura' | 'car'
export type MovieId = 'snatch' | 'scary-movie' | 'dont-menace' | 'eurotrip'

export type FoodId =
  | 'jaunmoku-place'
  | 'bauska-place'
  | 'parking-sandwiches'
  | 'big-tasty'
  | 'before-party'
  | 'solar-energy'
  | 'sushi'
  | 'pasta'
  | 'pizza'
  | 'custom'

export interface InvitationState {
  character: CharacterName | null
  consented: boolean
  date: string | null
  plan: PlanId | null
  castle: CastleId | null
  movieLocation: MovieLocationId | null
  movie: MovieId | null
  food: FoodId | null
  customFood: string
  customPlanText: string
}

export const initialInvitationState: InvitationState = {
  character: null,
  consented: false,
  date: null,
  plan: null,
  castle: null,
  movieLocation: null,
  movie: null,
  food: null,
  customFood: '',
  customPlanText: '',
}