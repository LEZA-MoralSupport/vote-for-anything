import { useEffect, useRef, useState } from 'react'

const EMOJI_CATEGORIES = [
  {
    label: 'อารมณ์',
    emojis: ['😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤔', '😴', '🥳', '😭', '😡', '🤯', '🥺', '🙄', '😏', '😇', '🤩', '😢'],
  },
  {
    label: 'การเรียน',
    emojis: ['📖', '📐', '🔬', '🧪', '🔭', '🌍', '💻', '🖨️', '📊', '📌', '📎', '🗂️', '📅', '⏰', '💡', '📝', '✏️', '📚', '🎓', '🧮'],
  },
  {
    label: 'งานอดิเรก',
    emojis: ['🎨', '🖌️', '🎭', '🎬', '📷', '🎮', '🎲', '🧩', '♟️', '🎤', '🎸', '🎹', '🥁', '🎻', '🎷', '🎺', '🎵', '🧶', '🪡', '🧵', '🧸', '🗳️', '📸', '🎳', '🧗', '🪁', '🎯'],
  },
  {
    label: 'กีฬา',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥊', '🥋', '⛳', '🏊', '🚴', '🏃', '🧗', '🎯', '🏋️', '🤸', '⛷️', '🏄', '🚵', '🥇', '🏆'],
  },
  {
    label: 'อาหารและเครื่องดื่ม',
    emojis: ['🍕', '🍔', '🍟', '🍣', '🍜', '🍩', '🧋', '🍪', '🍎', '🍉', '🥕', '🌮', '☕', '🍵', '🍰', '🍦', '🍫', '🍿', '🥗', '🍱', '🍗', '🍦', '🧁', '🍉'],
  },
  {
    label: 'สัตว์',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🐺', '🐴', '🦄', '🐝', '🦋', '🐢', '🐍', '🐙', '🐬', '🐳'],
  },
  {
    label: 'การเดินทาง',
    emojis: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚲', '🚆', '🚀', '⛵', '🏎️', '🚓', '🚑', '🚒', '🛵', '🏍️', '🚢', '🚁', '🗺️'],
  },
  {
    label: 'สถานที่',
    emojis: ['🏠', '🏡', '🏢', '🏫', '🏥', '🏦', '🏨', '🏪', '🏬', '🏭', '🏰', '💒', '🗼', '🗽', '⛩️', '🕌', '⛪', '🏟️', '🏝️', '🏕️'],
  },
  {
    label: 'ธรรมชาติ',
    emojis: ['🌈', '🌞', '🌙', '⭐', '✨', '🌠', '🌊', '🌸', '🌵', '🍀', '🍁', '🌲', '🌻', '🌋', '🔥', '❄️', '🌪️', '🌧️', '🌤️'],
  },
  {
    label: 'สัญลักษณ์',
    emojis: ['❤️', '🔥', '⚡', '🎉', '✅', '❌', '⭐', '💯', '🔔', '🎁', '🏅', '🚩', '💰', '🔑', '🔒'],
  },
]

function EmojiPlaceholderIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" strokeDasharray="2.5 3" />
      <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" />
      <line x1="9" y1="9.5" x2="9" y2="9.51" />
      <line x1="15" y1="9.5" x2="15" y2="9.51" />
    </svg>
  )
}

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="group relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl transition ${
          value
            ? 'border border-line bg-white hover:border-plum-500'
            : 'border border-dashed border-line bg-white text-ink/30 hover:border-plum-500 hover:text-plum-500'
        }`}
      >
        {value || <EmojiPlaceholderIcon />}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink/70 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="ลบสัญลักษณ์"
        >
          ✕
        </button>
      )}
      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-card border border-line bg-white p-3 shadow-card">
          <div className="no-scrollbar max-h-72 space-y-3 overflow-y-auto pr-1">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.label}>
                <p className="mb-1.5 px-1 text-xs font-medium text-ink/40">{category.label}</p>
                <div className="grid grid-cols-8 gap-1">
                  {category.emojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        onChange(e)
                        setOpen(false)
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-plum-50"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
