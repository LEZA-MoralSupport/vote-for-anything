import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getProgramme,
  createProgramme,
  updateProgramme,
  getChoices,
  addChoice,
  updateChoice,
  deleteChoice,
  uploadChoiceImage,
} from '../utils/firestore'
import EmojiPicker from '../components/EmojiPicker'
import ColorPicker from '../components/ColorPicker'
import PasswordModal from '../components/PasswordModal'

let tempIdCounter = 0
const newTempId = () => `temp-${Date.now()}-${tempIdCounter++}`

function emptyChoice() {
  return {
    id: newTempId(),
    isNew: true,
    name: '',
    icon: '',
    imageUrl: '',
    imagePath: '',
    description: '',
    color: '',
    _preview: '',
  }
}

function moveChoice(list, index, offset) {
  const targetIndex = index + offset
  if (targetIndex < 0 || targetIndex >= list.length) return list
  const next = [...list]
  const [moved] = next.splice(index, 1)
  next.splice(targetIndex, 0, moved)
  return next
}

export default function Edit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [name, setName] = useState('')
  const [choices, setChoices] = useState([emptyChoice()])
  const [removedChoiceIds, setRemovedChoiceIds] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [shuffleOnLoad, setShuffleOnLoad] = useState(false)
  const [showSavePassword, setShowSavePassword] = useState(false)

  useEffect(() => {
    if (!isNew) {
      ;(async () => {
        const p = await getProgramme(id)
        if (!p) {
          setError('ไม่พบฟอร์มนี้')
          setLoading(false)
          return
        }
        setName(p.name)
        setShuffleOnLoad(Boolean(p.shuffleOnLoad))
        const existing = await getChoices(id)
        setChoices(
          existing.length
            ? existing.map((c) => ({ ...c, isNew: false, _preview: '' }))
            : [emptyChoice()],
        )
        setLoading(false)
      })()
    }
  }, [id, isNew])

  function updateChoiceField(choiceId, field, value) {
    setChoices((prev) =>
      prev.map((c) => (c.id === choiceId ? { ...c, [field]: value } : c)),
    )
  }

  async function handleImageSelect(choiceId, file) {
    if (!file) return
    try {
      const uploaded = await uploadChoiceImage('', file)
      setChoices((prev) =>
        prev.map((c) =>
          c.id === choiceId
            ? { ...c, imageUrl: uploaded.url || '', imagePath: '', _preview: uploaded.url || '' }
            : c,
        ),
      )
    } catch (err) {
      console.error(err)
      setError('ไม่สามารถอ่านไฟล์รูปภาพได้')
    }
  }

  function removeImage(choiceId) {
    setChoices((prev) =>
      prev.map((c) =>
        c.id === choiceId ? { ...c, _preview: '', imageUrl: '', imagePath: '' } : c,
      ),
    )
  }

  function moveChoiceRow(index, offset) {
    setChoices((prev) => moveChoice(prev, index, offset))
  }

  function addChoiceRow() {
    setChoices((prev) => [...prev, emptyChoice()])
  }

  function removeChoiceRow(choiceId) {
    setChoices((prev) => {
      const target = prev.find((c) => c.id === choiceId)
      if (target && !target.isNew) {
        setRemovedChoiceIds((ids) => [...ids, choiceId])
      }
      const next = prev.filter((c) => c.id !== choiceId)
      return next.length ? next : [emptyChoice()]
    })
  }

  function handleSaveClick() {
    setError('')
    if (!name.trim()) {
      setError('กรุณาใส่ชื่อฟอร์มก่อน')
      return
    }
    const validChoices = choices.filter((c) => c.name.trim())
    if (validChoices.length < 2) {
      setError('ต้องมีตัวเลือกอย่างน้อย 2 รายการ')
      return
    }
    setShowSavePassword(true)
  }

  async function handleSaveConfirmed(value, setErrorMessage) {
    if (value !== 'admin') {
      setErrorMessage('รหัสผ่านไม่ถูกต้อง')
      return
    }

    setSaving(true)
    try {
      let programmeId = id
      if (isNew) {
        programmeId = await createProgramme(name.trim(), { shuffleOnLoad })
      } else {
        await updateProgramme(programmeId, {
          name: name.trim(),
          shuffleOnLoad,
        })
      }

      for (const choiceId of removedChoiceIds) {
        await deleteChoice(programmeId, choiceId)
      }

      let order = 0
      for (const c of choices.filter((item) => item.name.trim())) {
        const data = {
          name: c.name.trim(),
          icon: c.icon || '',
          imageUrl: c.imageUrl || '',
          imagePath: c.imagePath || '',
          description: c.description || '',
          color: c.color || '',
          order,
        }
        if (c.isNew) {
          await addChoice(programmeId, data, order)
        } else {
          await updateChoice(programmeId, c.id, data)
        }
        order += 1
      }

      navigate('/')
    } catch (e) {
      console.error(e)
      setError('บันทึกไม่สำเร็จ ลองลบรูป หรือ ใช้รูปที่ไฟล์เล็กกว่านี้')
    }
    setShowSavePassword(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-base text-ink/50">กำลังโหลด…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen paper-texture pb-24">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="text-[15px] text-ink/60 hover:text-ink"
        >
          ← ฟอร์มทั้งหมด
        </button>

        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
          {isNew ? 'สร้างฟอร์มการโหวตใหม่' : 'แก้ไขฟอร์มการโหวต'}
        </h1>

        <div className="mt-8 space-y-5 rounded-card border border-line bg-white p-6 shadow-card">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/50">ชื่อฟอร์ม</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ไปเที่ยวไหนกันดี?"
              className="w-full rounded-lg border border-line px-3 py-2 text-[15px] outline-none focus:border-plum-500"
            />
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[15px] text-ink/70">
            <input
              type="checkbox"
              checked={shuffleOnLoad}
              onChange={(e) => setShuffleOnLoad(e.target.checked)}
            />
            สุ่มลำดับตัวเลือกเมื่อเปิดฟอร์มใหม่
          </label>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">ตัวเลือก</h2>
        <div className="mt-4 space-y-4">
          {choices.map((c, idx) => (
            <div key={c.id} className="rounded-card border border-line bg-white p-5 shadow-card">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveChoiceRow(idx, -1)}
                    disabled={idx === 0}
                    aria-label="ย้ายขึ้น"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/50 hover:bg-black/5 hover:text-plum-600 disabled:opacity-25 disabled:hover:bg-transparent"
                  >
                    ▲
                  </button>
                  <span className="font-mono text-xs text-ink/30">{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveChoiceRow(idx, 1)}
                    disabled={idx === choices.length - 1}
                    aria-label="ย้ายลง"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/50 hover:bg-black/5 hover:text-plum-600 disabled:opacity-25 disabled:hover:bg-transparent"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex gap-3" >
                    <EmojiPicker
                      value={c.icon}
                      onChange={(v) => updateChoiceField(c.id, 'icon', v)}
                    />
                    <input
                      value={c.name}
                      onChange={(e) => updateChoiceField(c.id, 'name', e.target.value)}
                      placeholder="ชื่อตัวเลือก"
                      className="w-full flex-1 rounded-lg border border-line px-3 py-2 text-[15px] outline-none focus:border-plum-500"
                    />
                  </div>

                  <textarea
                    value={c.description}
                    onChange={(e) => updateChoiceField(c.id, 'description', e.target.value)}
                    placeholder="คำอธิบาย (ไม่บังคับ)"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-line px-3 py-2 text-[15px] outline-none focus:border-plum-500"
                  />
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-ink/50">สี (ไม่บังคับ)</p>
                    <ColorPicker
                      value={c.color}
                      onChange={(v) => updateChoiceField(c.id, 'color', v)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="mb-1.5 text-sm font-medium text-ink/50">รูปภาพ (ไม่บังคับ)</p>
                      <div className="flex items-center gap-2">
                        {(c._preview || c.imageUrl) ? (
                          <div className="group relative h-64 w-64 overflow-hidden rounded-lg">
                            <img
                              src={c._preview || c.imageUrl}
                              alt=""
                              className="h-full w-full rounded-lg object-cover p-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(c.id)}
                              className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-ink/80 text-[10px] text-white shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer rounded-lg border border-dashed border-line px-3 py-2 text-[15px] text-ink/60 hover:border-plum-500">
                            อัปโหลด
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageSelect(c.id, e.target.files?.[0])}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeChoiceRow(c.id)}
                  className="mt-1 text-xl text-ink/40 hover:text-plum-500"
                  aria-label="ลบตัวเลือก"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addChoiceRow}
          className="mt-4 w-full rounded-card border border-dashed border-line bg-white/50 py-3 text-[15px] font-medium text-ink/60 hover:border-plum-500 hover:text-plum-500"
        >
          + เพิ่มตัวเลือกอีกรายการ
        </button>

        {error && <p className="mt-4 text-base text-plum-500">{error}</p>}

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-paper/95 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-5xl justify-end">
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="rounded-lg bg-plum-600 px-6 py-2.5 text-[15px] font-medium text-white shadow-card hover:bg-plum-700 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก…' : 'บันทึกฟอร์ม'}
            </button>
          </div>
        </div>
      </div>

      {showSavePassword && (
        <PasswordModal
          title="กรอกรหัสผ่านเพื่อบันทึก"
          message="กรุณากรอกรหัสผ่านผู้ดูแล เพื่อบันทึกฟอร์มนี้"
          confirmLabel="บันทึก"
          onCancel={() => setShowSavePassword(false)}
          onConfirm={handleSaveConfirmed}
        />
      )}
    </div>
  )
}
