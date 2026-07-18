import { useState } from 'react'

export default function PasswordModal({
  title = 'กรอกรหัสผ่าน',
  message,
  confirmLabel = 'ต่อไป',
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onConfirm(value, setError)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card bg-paper shadow-card border border-line p-6 animate-fade-up"
      >
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        {message && <p className="mt-1 text-sm text-ink/60">{message}</p>}
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError('')
          }}
          placeholder="รหัสผ่าน"
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
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
