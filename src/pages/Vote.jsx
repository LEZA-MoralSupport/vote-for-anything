import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProgramme, getChoices, castVote } from '../utils/firestore'

function shuffleArray(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Vote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [programme, setProgramme] = useState(null)
  const [choices, setChoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [stampChoice, setStampChoice] = useState(null)
  const [votingId, setVotingId] = useState(null)
  const [confirmChoice, setConfirmChoice] = useState(null)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    const p = await getProgramme(id)
    const c = await getChoices(id)
    setProgramme(p)
    setChoices(p?.shuffleOnLoad ? shuffleArray(c) : c)
    setLoading(false)
  }

  function launchConfetti() {
    const colors = ['#8C2E52', '#D4A24E', '#3E6259', '#3B5B8C', '#B0466E']
    const layer = document.createElement('div')
    layer.className = 'pointer-events-none fixed inset-0 z-40 overflow-hidden'

    for (let i = 0; i < 36; i += 1) {
      const piece = document.createElement('span')
      piece.style.position = 'absolute'
      piece.style.left = `${Math.random() * 100}%`
      piece.style.top = '-10px'
      piece.style.width = `${6 + Math.random() * 8}px`
      piece.style.height = `${10 + Math.random() * 10}px`
      piece.style.background = colors[Math.floor(Math.random() * colors.length)]
      piece.style.opacity = '0'
      piece.style.setProperty('--tx', `${(Math.random() - 0.5) * 220}px`)
      piece.style.animation = `confetti-fall ${1.2 + Math.random() * 0.8}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
      layer.appendChild(piece)
    }

    document.body.appendChild(layer)
    window.setTimeout(() => layer.remove(), 1800)
  }

  async function castVoteConfirmed(choice) {
    if (votingId) return
    setVotingId(choice.id)
    try {
      // Firebase write happens first; confetti only fires once it resolves.
      await castVote(id, choice.id)
      setStampChoice(choice)
      launchConfetti()
      window.setTimeout(() => setStampChoice(null), 1400)
    } catch (e) {
      console.error(e)
    }
    setVotingId(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/50">Loading\u2026</p>
      </div>
    )
  }

  if (!programme) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/50">ไม่พบโครงการโหวตนี้</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen paper-texture">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/60 shadow-card hover:text-plum-600"
          >
            ← กลับไปที่ dashboard
          </button>
          <button
            onClick={() => navigate(`/score/${id}`)}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/60 shadow-card hover:text-plum-600"
          >
            👁️ ดูผลคะแนน
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-plum-500">เลือกตัวเลือกของคุณ</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{programme.name}</h1>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {choices.map((choice) => {
            const hasImage = Boolean(choice.imageUrl)
            const hasIcon = Boolean(choice.icon)
            const hasNothing = !hasImage && !hasIcon

            return (
              <button
                key={choice.id}
                onClick={() => setConfirmChoice(choice)}
                disabled={Boolean(votingId)}
                className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80"
                style={{
                  borderTopWidth: '4px',
                  borderTopColor: choice.color || '#8C2E52',
                }}
              >
                {hasNothing ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="font-display text-lg font-semibold text-ink">{choice.name}</p>
                    {choice.description && (
                      <p className="mt-1 text-sm text-ink/60">{choice.description}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center">
                      <p className="font-display text-lg font-semibold text-ink">{choice.name}</p>
                    </div>

                    <div className={`mb-3 flex flex-1 items-stretch justify-center overflow-hidden rounded-xl border ${hasImage ? 'border-line' : 'border-transparent'}`}>
                      {hasImage ? (
                        <img
                          src={choice.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-7xl leading-none">{choice.icon}</span>
                        </div>
                      )}
                    </div>

                    <p
                      className={`overflow-hidden text-sm text-ink/60 ${
                        choice.description?.trim() ? 'max-h-[5.25rem]' : 'min-h-[1.15rem]'
                      }`}
                    >
                      {choice.description}
                    </p>
                  </>
                )}

                {stampChoice?.id === choice.id && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-card bg-white/70">
                    <div className="sparkle-burst flex items-center gap-2 rounded-full border border-plum-200 bg-white px-3 py-2 text-sm font-semibold text-plum-700 shadow-lg">
                      <span className="text-base">✨</span>
                      <span>ส่งคะแนนแล้ว</span>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {choices.length === 0 && (
          <p className="mt-10 text-center text-sm text-ink/50">ยังไม่มีตัวเลือกในโครงการนี้</p>
        )}
      </div>

      {confirmChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-card bg-paper shadow-card border border-line p-6 animate-fade-up">
            <h2 className="font-display text-xl font-semibold text-ink">
              ต้องการโหวต "{confirmChoice.name}" ?
            </h2>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmChoice(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 hover:bg-black/5"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const choice = confirmChoice
                  setConfirmChoice(null)
                  castVoteConfirmed(choice)
                }}
                className="rounded-lg bg-plum-600 px-4 py-2 text-sm font-medium text-white hover:bg-plum-700"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
