import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ADMIN_PASSWORD, getProgramme, getChoices, resetVotes } from '../utils/firestore'
import PasswordModal from '../components/PasswordModal'

export default function Score() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(false)
  const [programme, setProgramme] = useState(null)
  const [choices, setChoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetInput, setResetInput] = useState('')
  const [resetError, setResetError] = useState('')

  useEffect(() => {
    if (unlocked) load()
  }, [unlocked])

  async function load() {
    setLoading(true)
    const p = await getProgramme(id)
    const c = await getChoices(id)
    setProgramme(p)
    setChoices([...c].sort((a, b) => b.votes - a.votes))
    setLoading(false)
  }

  async function handleReset() {
    if (resetInput.trim() !== 'ยืนยัน') {
      setResetError('พิมพ์ว่า "ยืนยัน" เพื่อยืนยัน')
      return
    }
    await resetVotes(id)
    setShowReset(false)
    setResetInput('')
    load()
  }

  if (!unlocked) {
    return (
      <PasswordModal
        title="กรอกรหัสผ่านเพื่อดูผลโหวต"
        message="กรุณากรอกรหัสผ่านผู้ดูแล เพื่อดูผลโหวตของฟอร์มนี้"
        confirmLabel="ดูผลคะแนน"
        onCancel={() => navigate(-1)}
        onConfirm={(value, setError) => {
          if (value !== ADMIN_PASSWORD) {
            setError('รหัสผ่านไม่ถูกต้อง')
            return
          }
          setUnlocked(true)
        }}
      />
    )
  }

  const totalVotes = choices.reduce((sum, c) => sum + (c.votes || 0), 0)
  const maxVotes = Math.max(1, ...choices.map((c) => c.votes || 0))

  return (
    <div className="min-h-screen paper-texture pb-24">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/vote/${id}`)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/60 shadow-card hover:text-plum-600"
          >
            ← กลับหน้ากล่าวโหวต
          </button>
          <button
            onClick={load}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/60 shadow-card hover:text-plum-600"
          >
            🔄 รีเฟรช
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-plum-500">ผลคะแนน</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {programme?.name || '\u2026'}
          </h1>
          <p className="mt-1 font-mono text-sm text-ink/50">รวม {totalVotes} คะแนน</p>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-sm text-ink/50"></p>
        ) : (
          <div className="mt-8 space-y-3">
            {choices.map((c, idx) => {
              const pct = totalVotes ? Math.round((c.votes / totalVotes) * 100) : 0
              return (
                <div key={c.id} className="rounded-card border border-line bg-white p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink/30">{idx + 1}</span>
                    {c.imageUrl ? (
                      <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
                        <img src={c.imageUrl} alt="" className="h-full w-full rounded-lg object-cover p-1" />
                      </div>
                    ) : c.icon ? (
                      <span
                        className="flex h-16 w-32 items-center justify-center rounded-lg bg-plum-50"
                        style={{ fontSize: '2.5rem' }} 
                      >
                        {c.icon}
                      </span>
                    ) : (
                      <span
                        className="h-14 w-14 rounded-lg"
                        style={{ backgroundColor: c.color || '#F3D9E1' }}
                      />
                    )}
                    <div className="self-end min-w-0 flex-1 pb-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-display font-semibold text-ink">{c.name}</p>
                        <p className="font-mono text-sm text-ink/60">
                          {c.votes || 0} <span className="text-ink/30">({pct}%)</span>
                        </p>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(c.votes / maxVotes) * 100}%`,
                            backgroundColor: c.color || '#8C2E52',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {choices.length === 0 && (
              <p className="text-center text-sm text-ink/50">ยังไม่มีตัวเลือกในโครงการนี้</p>
            )}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setShowReset(true)}
            className="rounded-lg border border-plum-500/30 px-4 py-2 text-sm font-medium text-plum-500 hover:bg-plum-50"
          >
            รีเซ็ทคะแนนโหวต
          </button>
        </div>
      </div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-card bg-paper shadow-card border border-line p-6 animate-fade-up">
            <h2 className="font-display text-xl font-semibold text-plum-600">ต้องการรีเซ็ทคะแนนใช่หรือไม่?</h2>
            <p className="mt-2 text-sm text-ink/70">
              ทึกคะแนนใน <strong>{programme?.name}</strong> จะถูกรีเซ็ทเป็น 0
              โดยที่ชอยส์ของแบบฟอร์มจะยังคงอยู่ คะแนนที่ถูกลบไปแล้วไม่สามารถกู้กลับคืนมาได้
            </p>
            <p className="mt-3 text-sm text-ink/60">
              พิมพ์คำว่า <strong>ยืนยัน</strong> เพื่อรีเซ็ทคะแนน
            </p>
            <input
              autoFocus
              value={resetInput}
              onChange={(e) => {
                setResetInput(e.target.value)
                setResetError('')
              }}
              placeholder="ยืนยัน"
              className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-plum-500"
            />
            {resetError && <p className="mt-2 text-sm text-plum-500">{resetError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReset(false)
                  setResetInput('')
                  setResetError('')
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 hover:bg-black/5"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg bg-plum-600 px-4 py-2 text-sm font-medium text-white hover:bg-plum-700"
              >
                รีเซ็ตคะแนน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
