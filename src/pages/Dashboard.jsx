import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProgrammes, deleteProgramme } from '../utils/firestore'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

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

        <div className="mt-8 space-y-3">
          {loading && <p className="text-sm text-ink/50">Loading...</p>}

          {!loading && programmes.length === 0 && (
            <div className="rounded-card border border-dashed border-line bg-white/50 p-10 text-center">
              <p className="font-display text-lg text-ink/70">ยังไม่มีการโหวตทั้งหมด</p>
              <p className="mt-1 text-sm text-ink/50">เริ่มสร้างโครงการแรกของคุณเลย</p>
            </div>
          )}

          {programmes.map((p) => (
            <div
              key={p.id}
              className="group flex items-center justify-between rounded-card border border-line bg-white px-5 py-4 shadow-card"
            >
              <button
                onClick={() => navigate(`/vote/${p.id}`)}
                className="flex-1 text-left"
              >
                <p className="font-display text-lg font-semibold text-ink">{p.name}</p>
              </button>

              <div className="flex items-center gap-1">
                <IconButton label="แก้ไข" onClick={() => navigate(`/edit/${p.id}`)}>
                  ✏️
                </IconButton>
                <IconButton label="ลบ" onClick={() => setDeleteTarget(p)} danger>
                  🗑️
                </IconButton>
              </div>
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
