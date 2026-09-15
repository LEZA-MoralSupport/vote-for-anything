import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProgrammes, updateProgramme, deleteProgramme } from '../utils/firestore'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

// Programmes without an explicit `order` field yet (created before the
// reorder feature existed) fall back to their fetched order (createdAt
// desc). Array.prototype.sort is stable, so ties keep that fallback order.
function sortProgrammes(list) {
  return [...list].sort((a, b) => {
    const hasA = typeof a.order === 'number'
    const hasB = typeof b.order === 'number'
    if (hasA && hasB) return a.order - b.order
    if (hasA) return -1
    if (hasB) return 1
    return 0
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [draggingId, setDraggingId] = useState(null)

  const rowRefs = useRef({})

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const list = await getProgrammes()
      setProgrammes(list)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function handleDeleteConfirm() {
    deleteProgramme(deleteTarget.id).then(() => {
      setDeleteTarget(null)
      load()
    })
  }

  function persistOrder(list) {
    // shuffleOnLoad has to be passed through explicitly — updateProgramme
    // always re-writes it based on what it's given, so leaving it out
    // would silently turn it off for every programme touched here.
    list.forEach((p, i) => {
      updateProgramme(p.id, { order: i, shuffleOnLoad: p.shuffleOnLoad }).catch((e) =>
        console.error('เลื่อนลำดับไม่สำเร็จ', p.id, e),
      )
    })
  }

  function handleDragStart(id) {
    if (search.trim()) return // reordering while filtered isn't well-defined
    setDraggingId(id)
  }

  useEffect(() => {
    if (!draggingId) return

    function handlePointerMove(e) {
      const entry = Object.entries(rowRefs.current).find(([, el]) => {
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return e.clientY >= rect.top && e.clientY <= rect.bottom
      })
      if (!entry) return
      const overId = entry[0]
      if (overId === draggingId) return

      setProgrammes((prev) => {
        const sorted = sortProgrammes(prev)
        const fromIndex = sorted.findIndex((p) => p.id === draggingId)
        const toIndex = sorted.findIndex((p) => p.id === overId)
        if (fromIndex === -1 || toIndex === -1) return prev
        const next = [...sorted]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        return next.map((p, i) => ({ ...p, order: i }))
      })
    }

    function handlePointerUp() {
      setDraggingId(null)
      setProgrammes((prev) => {
        const sorted = sortProgrammes(prev)
        persistOrder(sorted)
        return sorted
      })
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draggingId])

  const sortedProgrammes = sortProgrammes(programmes)
  const filteredProgrammes = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return sortedProgrammes
    return sortedProgrammes.filter((p) => p.name.toLowerCase().includes(term))
  }, [programmes, search])

  return (
    <div className="min-h-screen paper-texture">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-plum-500">ผู้ดูแล</p>
            <h1 className="font-display text-3xl font-semibold text-ink">ฟอร์มการโหวตทั้งหมด</h1>
          </div>
          <button
            onClick={() => navigate('/edit/new')}
            className="rounded-lg bg-plum-600 px-4 py-2 text-sm font-medium text-white shadow-card hover:bg-plum-700"
          >
            + เพิ่มแบบฟอร์มโหวต
          </button>
        </div>

        <div className="relative mt-6">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/30">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาฟอร์ม..."
            className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-[15px] outline-none focus:border-plum-500"
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading && <p className="text-sm text-ink/50">Loading...</p>}

          {!loading && programmes.length === 0 && (
            <div className="rounded-card border border-dashed border-line bg-white/50 p-10 text-center">
              <p className="font-display text-lg text-ink/70">ยังไม่มีการโหวตทั้งหมด</p>
              <p className="mt-1 text-sm text-ink/50">เริ่มสร้างโครงการแรกของคุณเลย</p>
            </div>
          )}

          {!loading && programmes.length > 0 && filteredProgrammes.length === 0 && (
            <div className="rounded-card border border-dashed border-line bg-white/50 p-10 text-center">
              <p className="text-sm text-ink/50">ไม่พบฟอร์มที่ตรงกับ "{search}"</p>
            </div>
          )}

          {filteredProgrammes.map((p) => (
            <div
              key={p.id}
              ref={(el) => {
                rowRefs.current[p.id] = el
              }}
              className={`group flex items-center gap-3 rounded-card border border-line bg-white px-4 py-4 shadow-card transition ${
                draggingId === p.id ? 'opacity-50' : ''
              }`}
            >
              <button
                type="button"
                onPointerDown={() => handleDragStart(p.id)}
                disabled={Boolean(search.trim())}
                aria-label="ลากเพื่อเรียงลำดับ"
                title={search.trim() ? 'ล้างช่องค้นหาก่อนเพื่อเรียงลำดับ' : 'ลากเพื่อเรียงลำดับ'}
                className="flex h-8 w-6 flex-shrink-0 items-center justify-center rounded text-ink/30 hover:bg-black/5 hover:text-plum-600 disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:bg-transparent"
                style={{ touchAction: 'none', cursor: draggingId === p.id ? 'grabbing' : 'grab' }}
              >
                ⠿
              </button>

              <button
                onClick={() => navigate(`/vote/${p.id}`)}
                className="flex-1 text-left"
              >
                <p className="font-display text-lg font-semibold text-ink">{p.name}</p>
              </button>

              {/* <div className="flex items-center gap-1">
                <IconButton label="แก้ไข" onClick={() => navigate(`/edit/${p.id}`)}>
                  ✏️
                </IconButton>
                <IconButton label="ลบ" onClick={() => setDeleteTarget(p)} danger>
                  🗑️
                </IconButton>
              </div> */}
            </div>
          ))}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          programmeName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

function IconButton({ children, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-base transition hover:bg-black/5 ${
        danger ? 'hover:bg-plum-50' : ''
      }`}
    >
      {children}
    </button>
  )
}
