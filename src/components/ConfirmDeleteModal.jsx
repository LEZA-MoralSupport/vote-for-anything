import { useState } from 'react'

// Step 1: type the programme name to confirm intent + show irreversible warning.
// Step 2: type the word "ยืนยัน" to confirm (no password needed for delete).
export default function ConfirmDeleteModal({ programmeName, onConfirm, onCancel }) {
  const [step, setStep] = useState(1)
  const [typedName, setTypedName] = useState('')
  const [confirmWord, setConfirmWord] = useState('')
  const [error, setError] = useState('')

  function handleStep1(e) {
    e.preventDefault()
    if (typedName.trim() !== programmeName.trim()) {
      setError('ชื่อไม่ตรงกัน กรุณาพิมพ์ให้ตรงกับชื่อฟอร์ม')
      return
    }
    setStep(2)
  }

  function handleStep2(e) {
    e.preventDefault()
    if (confirmWord.trim() !== 'ยืนยัน') {
      setError('พิมพ์ว่า "ยืนยัน" เพื่อยืนยันการลบ')
      return
    }
    onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-card bg-paper shadow-card border border-line p-6 animate-fade-up">
        {step === 1 ? (
          <form onSubmit={handleStep1}>
            <h2 className="font-display text-xl font-semibold text-plum-600">ลบฟอร์มการโหวตนี้?</h2>
            <p className="mt-2 text-sm text-ink/70">
              การลบนี้จะลบ <strong>{programmeName}</strong> และตัวเลือกและคะแนนทั้งหมดในฟอร์มนี้อย่างถาวรและไม่สามารถย้อนกลับได้
            </p>
            <p className="mt-3 text-sm text-ink/60">
              พิมพ์ <strong>{programmeName}</strong> ด้านล่างเพื่อยืนยัน
            </p>
            <input
              autoFocus
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value)
                setError('')
              }}
              className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-plum-500"
              placeholder={programmeName}
            />
            {error && <p className="mt-2 text-sm text-plum-500">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 hover:bg-black/5"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-lg bg-plum-600 px-4 py-2 text-sm font-medium text-white hover:bg-plum-700"
              >
                ต่อไป
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStep2}>
            <h2 className="font-display text-xl font-semibold text-ink">ยืนยันการลบ</h2>
            <p className="mt-1 text-sm text-ink/60">
              พิมพ์ <strong>ยืนยัน</strong> เพื่อลบ <strong>{programmeName}</strong> อย่างถาวร
            </p>
            <input
              autoFocus
              value={confirmWord}
              onChange={(e) => {
                setConfirmWord(e.target.value)
                setError('')
              }}
              placeholder="ยืนยัน"
              className="mt-4 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-plum-500"
            />
            {error && <p className="mt-2 text-sm text-plum-500">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 hover:bg-black/5"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-lg bg-plum-600 px-4 py-2 text-sm font-medium text-white hover:bg-plum-700"
              >
                ลบถาวร
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
