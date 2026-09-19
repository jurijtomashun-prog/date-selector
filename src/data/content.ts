import type {
  CastleId,
  CharacterName,
  FoodId,
  MovieId,
  MovieLocationId,
  PlanId,
} from '../types'

export const characters: CharacterName[] = ['Татьяна', 'Таня', 'Танюха']

export const plans: Array<{ id: PlanId; title: string; description: string }> = [
  {
    id: 'trip',
    title: 'Едем подальше от Риги',
    description: 'Немного дороги, много красоты и законный повод купить снеки.',
  },
  {
    id: 'party',
    title: 'Вечерняя туса',
    description:
      'Клубим до 3 утра в городе. Точнее, до 22:15: приём витаминов и лекарств никто не отменял, как и боль в коленях!..',
  },
  {
    id: 'movie',
    title: 'Домашняя киношечка',
    description: 'Плед, экран и очень серьёзный киноотбор.',
  },
  {
    id: 'gastro',
    title: 'Развратный гастро-тур',
    description:
      'Двигаемся от точки до точки по городу, принимаем разные увеселительные напитки и еду. Тут уж кто сколько осилит...',
  },
]

export const castles: Array<{ id: CastleId; label: string }> = [
  { id: 'jaunmoku', label: 'Jaunmoku pils' },
  { id: 'rundale', label: 'Rundāles pils' },
  { id: 'birini', label: 'Bīriņu pils' },
]

export const movieLocations: Array<{ id: MovieLocationId; label: string }> = [
  { id: 'hers', label: 'У {name} дома' },
  { id: 'yura', label: 'У Юры дома' },
  { id: 'car', label: 'На телефоне в машине на парковке...' },
]

const homeName: Record<CharacterName, string> = {
  Татьяна: 'Татьяны',
  Таня: 'Тани',
  Танюха: 'Танюхи',
}

export const getMovieLocationLabel = (
  location: (typeof movieLocations)[number],
  character: CharacterName | null,
) => location.label.replace('{name}', character ? homeName[character] : 'Тани')

export const movies: Array<{ id: MovieId; label: string }> = [
  { id: 'snatch', label: '«Снэтч» в переводе Гоблина' },
  { id: 'scary-movie', label: '«Очень страшное кино» 2 и 3' },
  { id: 'dont-menace', label: '«Не грози Южному централу»' },
  { id: 'eurotrip', label: '«Евротур»' },
]

export const foodLabels: Record<FoodId, string> = {
  'jaunmoku-place': 'Рядом с Jaunmoku pils точно было что-то занимательное',
  'bauska-place': 'Место в Бауске, которое Юре очень советовали',
  'parking-sandwiches':
    'Берём в Римчике треугольные бутеры и точим их на парковке с лимонадом и винчиком... ммм...',
  'big-tasty':
    'После тусовки идём в Мак: заточить Биг Тейсти на ночь — самое то',
  'before-party':
    'Кушаем до тусы и потом вяло идём танцевать. Ведь кто танцует после еды...',
  'solar-energy': 'Еда для слабаков, я питаюсь солнечной энергией!',
  sushi: 'Заказываем суши',
  pasta: 'Юра готовит пасту с лисичками',
  pizza: 'Заказываем пиццу и просто объедаемся ей!',
  custom: 'Твой вариант',
}

export function getFoodOptions(plan: PlanId, castle: CastleId | null): FoodId[] {
  if (plan === 'party') {
    return ['big-tasty', 'before-party', 'solar-energy']
  }
  if (plan === 'movie') {
    return ['sushi', 'pasta', 'pizza', 'custom']
  }
  if (plan === 'trip') {
    const destinationOption =
      castle === 'jaunmoku'
        ? 'jaunmoku-place'
        : castle === 'rundale'
          ? 'bauska-place'
          : null
    return destinationOption
      ? [destinationOption, 'parking-sandwiches']
      : ['parking-sandwiches']
  }
  return []
}

export const labelFor = <T extends string>(
  items: Array<{ id: T; label?: string; title?: string }>,
  id: T | null,
) => items.find((item) => item.id === id)?.label ??
  items.find((item) => item.id === id)?.title ??
  ''