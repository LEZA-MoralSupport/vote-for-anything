export const COLOR_PRESETS = [
  '#C4622D', // clay
  '#D4A24E', // gold
  '#8A6F4D', // bronze
  '#556B2F', // moss
  '#3E6259', // pine
  '#2F6F73', // teal
  '#3B5B8C', // denim
  '#4F5D75', // slate
  '#6B5B95', // violet
  '#8C2E52', // plum
  '#B0466E', // rose
  '#A65E4A', // terracotta
  '#6D7A3D', // olive
]

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(value === c ? '' : c)}
          className="h-8 w-8 rounded-lg ring-offset-2 transition"
          style={{
            backgroundColor: c,
            boxShadow: value === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
          }}
          aria-label={c}
        />
      ))}
    </div>
  )
}
