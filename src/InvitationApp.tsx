import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CalendarHeart,
  Check,
  Download,
  Film,
  Heart,
  Mail,
  MapPinned,
  Martini,
  Mic,
  PenLine,
  RotateCcw,
  Sparkles,
  Star,
  Utensils,
} from 'lucide-react'
import './InvitationApp.css'
import {
  castles,
  characterTitles,
  characters,
  foodLabels,
  getFoodOptions,
  getMovieLocationLabel,
  movieLocations,
  movies,
  plans,
} from './data/content'
import { createCalendarEvent, describeInvitation } from './domain/createCalendarEvent'
import { getDateRule } from './domain/dateRules'
import { usePersistedInvitation } from './hooks/usePersistedInvitation'
import type { InvitationState, PlanId } from './types'

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function detailsComplete(state: InvitationState) {
  if (state.plan === 'trip') return Boolean(state.castle)
  if (state.plan === 'movie') return Boolean(state.movieLocation && state.movie)
  if (state.plan === 'custom') return Boolean(state.customPlanText.trim())
  return Boolean(state.plan)
}

function foodComplete(state: InvitationState) {
  if (state.plan === 'gastro' || state.plan === 'custom') return true
  return Boolean(state.food && (state.food !== 'custom' || state.customFood.trim()))
}

function deriveStep(state: InvitationState): Step {
  if (!state.character) return 0
  if (!state.consented) return 1
  if (!state.date) return 2
  if (!state.plan) return 3
  if (!detailsComplete(state)) return 4
  if (!foodComplete(state)) return 5
  return 6
}

function FloatingBackground() {
  return (
    <div className="floaters" aria-hidden="true">
      <Heart className="floater floater-one" />
      <Sparkles className="floater floater-two" />
      <Star className="floater floater-three" />
      <Mail className="floater floater-four" />
      <Heart className="floater floater-five" />
      <Sparkles className="floater floater-six" />
      <Heart className="floater floater-seven" />
      <Star className="floater floater-eight" />
      <Heart className="floater floater-nine" />
      <Mail className="floater floater-ten" />
    </div>
  )
}

function Choice({ selected, title, description, icon, onClick }: {
  selected: boolean
  title: string
  description?: string
  icon?: ReactNode
  onClick: () => void
}) {
  return (
    <button type="button" className={`choice ${selected ? 'is-selected' : ''}`} onClick={onClick} aria-pressed={selected}>
      {icon && <span className="choice-icon">{icon}</span>}
      <span className="choice-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      <span className="choice-check" aria-hidden="true">{selected && <Check size={16} strokeWidth={3} />}</span>
    </button>
  )
}

function StepHeader({ eyebrow, title, tagline, copy }: { eyebrow: string; title: string; tagline?: string; copy?: string }) {
  return (
    <header className="step-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {tagline && <p className="tagline">{tagline}</p>}
      {copy && <p>{copy}</p>}
    </header>
  )
}

function MonthCalendar({ year, month, title, selectedDate, onDateClick }: {
  year: number
  month: number
  title: string
  selectedDate: string | null
  onDateClick: (date: string, message?: string, selectable?: boolean) => void
}) {
  const dayCount = new Date(year, month, 0).getDate()
  const mondayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const days = Array.from({ length: dayCount }, (_, index) => index + 1)

  return (
    <section className="month" aria-label={title}>
      <h2>{title}</h2>
      <div className="weekdays" aria-hidden="true">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="days">
        {Array.from({ length: mondayOffset }, (_, index) => <span className="day-spacer" key={`spacer-${index}`} />)}
        {days.map((day) => {
          const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const rule = getDateRule(isoDate)
          const trulyDisabled = !rule.selectable && !rule.message
          return (
            <button
              type="button"
              key={isoDate}
              className={`day ${selectedDate === isoDate ? 'is-selected' : ''} ${!rule.selectable ? 'is-unavailable' : ''}`}
              disabled={trulyDisabled}
              aria-disabled={!rule.selectable}
              aria-label={`${day} ${title}${rule.message ? `. ${rule.message}` : ''}`}
              onClick={() => onDateClick(isoDate, rule.message, rule.selectable)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function InvitationApp() {
  const { state, update, reset } = usePersistedInvitation()
  const [step, setStep] = useState<Step>(() => deriveStep(state))
  const [notice, setNotice] = useState('')
  const [consentSuccess, setConsentSuccess] = useState(false)
  const [noAttempts, setNoAttempts] = useState(0)
  const [noPosition, setNoPosition] = useState({ left: 80, top: 12 })
  const [shared, setShared] = useState(false)

  const foodOptions = useMemo(
    () => state.plan ? getFoodOptions(state.plan, state.castle) : [],
    [state.plan, state.castle],
  )

  const goBack = () => {
    setNotice('')
    if (step === 6) {
      if (state.plan === 'gastro') setStep(3)
      else if (state.plan === 'custom') setStep(4)
      else setStep(5)
    } else if (step === 5) {
      setStep(state.plan === 'trip' || state.plan === 'movie' ? 4 : 3)
    } else if (step > 0) {
      setStep((step - 1) as Step)
    }
  }

  const chooseCharacter = (character: InvitationState['character']) => {
    update({ character, consented: false, date: null, plan: null, castle: null, movieLocation: null, movie: null, food: null, customFood: '', customPlanText: '' })
    window.setTimeout(() => setStep(1), 280)
  }

  const acceptDate = (date: string, message?: string, selectable = true) => {
    setNotice(message ?? '')
    if (selectable) {
      update({ date, plan: null, castle: null, movieLocation: null, movie: null, food: null, customFood: '', customPlanText: '' })
    }
  }

  const selectPlan = (plan: PlanId) => {
    update({ plan, castle: null, movieLocation: null, movie: null, food: null, customFood: '', customPlanText: '' })
    setNotice('')
  }

  const evadeNo = (pointerType: string) => {
    if (pointerType !== 'mouse' || !window.matchMedia('(pointer: fine)').matches) return
    const positions = [
      { left: 6, top: 10 }, { left: 78, top: 8 }, { left: 8, top: 78 },
      { left: 80, top: 76 }, { left: 4, top: 44 }, { left: 84, top: 46 },
    ]
    setNoPosition(positions[Math.floor(Math.random() * positions.length)])
    setNoAttempts((value) => value + 1)
  }

  const rejectOnTouch = () => {
    setNotice('Неправильный ответ')
    setNoAttempts((value) => value + 1)
    const positions = [
      { left: 6, top: 10 }, { left: 78, top: 8 }, { left: 8, top: 78 },
      { left: 80, top: 76 }, { left: 4, top: 44 }, { left: 84, top: 46 },
    ]
    setNoPosition(positions[Math.floor(Math.random() * positions.length)])
  }

  const sayYes = () => {
    update({ consented: true })
    setNotice('')
    setConsentSuccess(true)
    window.setTimeout(() => {
      setConsentSuccess(false)
      setStep(2)
    }, 1100)
  }

  const resetAll = () => {
    reset()
    setStep(0)
    setNotice('')
    setNoAttempts(0)
    setShared(false)
  }

  const makeCalendarFile = () => {
    const contents = createCalendarEvent(state)
    return new File([contents], `svidanka-${state.date}.ics`, { type: 'text/calendar;charset=utf-8' })
  }

  const downloadCalendar = () => {
    const file = makeCalendarFile()
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
    setShared(true)
  }

  const planIcons: Record<PlanId, ReactNode> = {
    trip: <MapPinned size={22} />,
    party: <Martini size={22} />,
    movie: <Film size={22} />,
    karaoke: <Mic size={22} />,
    gastro: <Utensils size={22} />,
    custom: <PenLine size={22} />,
  }

  return (
    <main className="app-shell">
      <FloatingBackground />
      <section className="paper" aria-live="polite">
        <div className="paper-pin"><Heart size={15} fill="currentColor" /></div>

        {step > 0 && !consentSuccess && (
          <nav className="topbar" aria-label="Навигация">
            <button type="button" className="icon-button" onClick={goBack} aria-label="Назад" title="Назад"><ArrowLeft size={20} /></button>
            <div className="progress" aria-label={`Шаг ${Math.min(step + 1, 7)} из 7`}>
              {Array.from({ length: 7 }, (_, index) => <span key={index} className={index <= step ? 'active' : ''} />)}
            </div>
            <button type="button" className="icon-button" onClick={resetAll} aria-label="Начать заново" title="Начать заново"><RotateCcw size={18} /></button>
          </nav>
        )}

        <div className="step" key={`${step}-${consentSuccess}`}>
          {step === 0 && (
            <>
              <StepHeader eyebrow="Очень официальный сервис" title="Power Dating" tagline="Dating as a Service (DaaS)" copy="Протокол выбора прекрасного вечера. Ошибиться почти невозможно." />
              <div className="section-label">Выбор персонажа</div>
              <div className="character-list">
                {characters.map((character) => (
                  <button type="button" key={character} className={`character-tag ${state.character === character ? 'is-selected' : ''}`} onClick={() => chooseCharacter(character)}>
                    <span>{character}</span>
                  </button>
                ))}
              </div>
              <p className="tiny-note">Выбирай внимательно. Все персонажи подозрительно прекрасны.</p>
            </>
          )}

          {step === 1 && !consentSuccess && (
            <>
              <StepHeader eyebrow="Главный вопрос" title={`${state.character}, идём на свиданку?`} copy="Комиссия уже рассмотрела заявку и настроена оптимистично." />
              {state.character && <p className="persona-badge">Статус: {characterTitles[state.character]}</p>}
              <div className="consent-arena">
                <button type="button" className="primary yes-button" onClick={sayYes}><Heart size={19} fill="currentColor" /> Да, конечно</button>
                {noAttempts < 7 && (
                  <button
                    type="button"
                    className="no-button"
                    style={{ left: `${noPosition.left}%`, top: `${noPosition.top}%`, transform: `scale(${Math.pow(0.8, noAttempts)})` }}
                    onPointerEnter={(event) => evadeNo(event.pointerType)}
                    onClick={rejectOnTouch}
                  >Нет</button>
                )}
                {noAttempts >= 7 && <span className="no-gone">Ну вот и договорились.</span>}
              </div>
              {notice && <div className="notice wrong">{notice}</div>}
            </>
          )}

          {consentSuccess && (
            <div className="success-interstitial"><Sparkles size={34} /><h1>Чуууудно,<br />правильный выбор :)</h1></div>
          )}

          {step === 2 && (
            <>
              <StepHeader eyebrow="Когда встречаемся" title="Выбираем дату" copy="Два месяца перед нами. Но лучше долго не тянуть." />
              <div className="calendar-pair">
                <MonthCalendar year={2026} month={9} title="Сентябрь 2026" selectedDate={state.date} onDateClick={acceptDate} />
                <MonthCalendar year={2026} month={10} title="Октябрь 2026" selectedDate={state.date} onDateClick={acceptDate} />
              </div>
              {notice && <div className="notice">{notice}</div>}
              {state.date && <button type="button" className="primary continue" onClick={() => setStep(3)}>Дата годится <Check size={18} /></button>}
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader eyebrow="Куда и зачем" title="Выбор плана — надёжного, как швейцарские часы" />
              <div className="choice-list plan-list">
                {plans.map((plan) => <Choice key={plan.id} selected={state.plan === plan.id} title={plan.title} description={plan.description} icon={planIcons[plan.id]} onClick={() => selectPlan(plan.id)} />)}
              </div>
              {state.plan && (
                <button
                  type="button"
                  className="primary continue"
                  onClick={() => {
                    if (state.plan === 'gastro') setStep(6)
                    else if (state.plan === 'custom') setStep(4)
                    else if (state.plan === 'party' || state.plan === 'karaoke') setStep(5)
                    else setStep(4)
                  }}
                >
                  План утверждён <Check size={18} />
                </button>
              )}
            </>
          )}

          {step === 4 && state.plan === 'trip' && (
            <>
              <StepHeader eyebrow="Выездная комиссия" title="Куда держим путь?" copy="Четыре направления, одно из них — с подвохом." />
              <div className="choice-list">
                {castles.map((castle) => <Choice key={castle.id} selected={state.castle === castle.id} title={castle.label} description={castle.description} onClick={() => update({ castle: castle.id, food: null })} />)}
              </div>
              {state.castle && <button type="button" className="primary continue" onClick={() => setStep(5)}>Погнали <MapPinned size={18} /></button>}
            </>
          )}

          {step === 4 && state.plan === 'movie' && (
            <>
              <StepHeader eyebrow="Киносовет" title="Где и что смотрим?" copy="Оба решения будут занесены в протокол." />
              <fieldset>
                <legend>Дислокация</legend>
                <div className="choice-list compact">
                  {movieLocations.map((location) => {
                    const label = getMovieLocationLabel(location, state.character)
                    return <Choice key={location.id} selected={state.movieLocation === location.id} title={label} onClick={() => update({ movieLocation: location.id })} />
                  })}
                </div>
              </fieldset>
              <fieldset>
                <legend>Культурная программа</legend>
                <div className="choice-list compact">
                  {movies.map((movie) => <Choice key={movie.id} selected={state.movie === movie.id} title={movie.label} onClick={() => update({ movie: movie.id })} />)}
                </div>
              </fieldset>
              {detailsComplete(state) && <button type="button" className="primary continue" onClick={() => setStep(5)}>Кино выбрано <Film size={18} /></button>}
            </>
          )}

          {step === 4 && state.plan === 'custom' && (
            <>
              <StepHeader eyebrow="Импровизация приветствуется" title="Твой сценарий" copy="Опиши, что хочется сделать — согласуем детали лично." />
              <label className="custom-field">
                <span>Твой план на вечер</span>
                <textarea value={state.customPlanText} onChange={(event) => update({ customPlanText: event.target.value })} placeholder="Например: пикник у канала и потом мороженое" maxLength={220} autoFocus />
              </label>
              {detailsComplete(state) && <button type="button" className="primary continue" onClick={() => setStep(6)}>План принят <Sparkles size={18} /></button>}
            </>
          )}

          {step === 5 && state.plan && (
            <>
              <StepHeader eyebrow="Вопрос повышенной важности" title="Навернуть бы..." copy={state.plan === 'movie' ? 'В комплекте — аперольчик.' : undefined} />
              <div className="choice-list">
                {foodOptions.map((food) => <Choice key={food} selected={state.food === food} title={foodLabels[food]} onClick={() => update({ food, customFood: food === 'custom' ? state.customFood : '' })} />)}
              </div>
              {state.food === 'custom' && (
                <label className="custom-field"><span>Твой гастрономический манёвр</span><textarea value={state.customFood} onChange={(event) => update({ customFood: event.target.value })} placeholder="Например: хачапури и ни о чём не жалеть..." maxLength={180} autoFocus /></label>
              )}
              {foodComplete(state) && <button type="button" className="primary continue" onClick={() => setStep(6)}>К финальному протоколу <Sparkles size={18} /></button>}
            </>
          )}

          {step === 6 && (
            <>
              <StepHeader eyebrow="Решение принято" title="Свиданка собрана" copy="План выглядит убедительно. Подпись, печать, апероль." />
              <div className="ticket">
                <div className="ticket-stamp"><CalendarHeart size={26} /><span>{state.date && new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(`${state.date}T12:00:00`))}</span></div>
                <h2>{state.character} и Юра</h2>
                <div className="ticket-rule" />
                {describeInvitation(state).split('\n').slice(1).map((line) => {
                  const [label, ...rest] = line.split(': ')
                  return <div className="summary-row" key={line}><span>{label}</span><strong>{rest.join(': ')}</strong></div>
                })}
              </div>
              <p className="send-copy">Пришли этот файлик и Юре тоже.</p>
              <div className="final-actions">
                <button type="button" className="primary" onClick={downloadCalendar}><Download size={19} /> Скачать для календаря</button>
              </div>
              {shared && <div className="notice final-notice"><Heart size={16} fill="currentColor" /> Теперь всё официально. Почти.</div>}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
