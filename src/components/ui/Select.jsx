import ReactSelect from 'react-select'

/**
 * FitOS themed Select — wraps react-select with the dark palette.
 *
 * API matches a plain <select> for easy drop-in:
 *   value       — the current string value (not an option object)
 *   onChange    — called with the new string value (not an option object)
 *   options     — [{ value, label }] array
 *   placeholder — placeholder string
 *   isDisabled
 *   isClearable — show × to clear (default false)
 *   isMulti     — multi-select mode (default false)
 *   className   — applied to the wrapper div
 *
 * Single-select example:
 *   <Select
 *     value={form.role}
 *     onChange={(val) => setForm(v => ({ ...v, role: val }))}
 *     options={[
 *       { value: 'manager',      label: 'Manager' },
 *       { value: 'trainer',      label: 'Trainer' },
 *       { value: 'receptionist', label: 'Receptionist' },
 *     ]}
 *     placeholder="Select role"
 *   />
 *
 * Multi-select example — value/onChange become arrays of string ids:
 *   <Select
 *     isMulti
 *     value={form.equipmentIds}
 *     onChange={(vals) => setForm(v => ({ ...v, equipmentIds: vals }))}
 *     options={equipmentOptions}
 *     placeholder="Link equipment (optional)"
 *   />
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  isDisabled = false,
  isClearable = false,
  isMulti = false,
  className = '',
}) {
  // react-select works with { value, label } objects internally.
  // We keep the external API as plain string values (or an array of them
  // in multi-select mode).
  const selected = isMulti
    ? options.filter((o) => Array.isArray(value) && value.includes(o.value))
    : options.find((o) => o.value === value) ?? null

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background:   'rgba(255,255,255,0.04)',
      borderColor:  state.isFocused
        ? 'rgba(200,241,53,0.4)'
        : 'rgba(255,255,255,0.10)',
      borderRadius: '0.5rem',
      boxShadow:    'none',
      minHeight:    '42px',
      cursor:       'pointer',
      transition:   'border-color 0.15s',
      '&:hover': {
        borderColor: state.isFocused
          ? 'rgba(200,241,53,0.4)'
          : 'rgba(255,255,255,0.18)',
      },
    }),

    valueContainer: (base) => ({
      ...base,
      padding: '0 14px',
    }),

    singleValue: (base) => ({
      ...base,
      color:    '#F5F4EF',
      fontSize: '14px',
    }),

    placeholder: (base) => ({
      ...base,
      color:    'rgba(255,255,255,0.20)',
      fontSize: '14px',
    }),

    input: (base) => ({
      ...base,
      color:    '#F5F4EF',
      fontSize: '14px',
    }),

    menu: (base) => ({
      ...base,
      background:   '#161616',
      border:       '1px solid rgba(255,255,255,0.10)',
      borderRadius: '0.75rem',
      boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
      overflow:     'hidden',
      zIndex:       50,
    }),

    menuList: (base) => ({
      ...base,
      padding: '4px',
    }),

    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? 'rgba(200,241,53,0.15)'
        : state.isFocused
          ? 'rgba(255,255,255,0.06)'
          : 'transparent',
      color: state.isSelected
        ? '#C8F135'
        : '#F5F4EF',
      fontSize:     '14px',
      borderRadius: '0.5rem',
      cursor:       'pointer',
      padding:      '8px 12px',
      transition:   'background 0.1s',
    }),

    indicatorSeparator: () => ({ display: 'none' }),

    dropdownIndicator: (base, state) => ({
      ...base,
      color:      state.isFocused ? '#C8F135' : '#888880',
      padding:    '0 10px 0 0',
      transition: 'color 0.15s, transform 0.2s',
      transform:  state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      '&:hover': { color: '#C8F135' },
    }),

    clearIndicator: (base) => ({
      ...base,
      color:   '#888880',
      padding: '0 4px',
      '&:hover': { color: '#F5F4EF' },
    }),

    noOptionsMessage: (base) => ({
      ...base,
      color:    '#888880',
      fontSize: '13px',
    }),

    // Multi-select chips
    multiValue: (base) => ({
      ...base,
      background:   'rgba(200,241,53,0.12)',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color:    '#C8F135',
      fontSize: '12px',
      padding:  '2px 4px 2px 8px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color:        '#C8F135',
      borderRadius: '0 0.375rem 0.375rem 0',
      '&:hover': { background: 'rgba(200,241,53,0.25)', color: '#C8F135' },
    }),

    // Rendered via menuPortalTarget (see below) — the portal itself escapes
    // any ancestor's overflow/scroll clipping, but still needs a z-index
    // above modal overlays (z-50) so it isn't tucked behind them.
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }

  function handleChange(opt) {
    if (isMulti) {
      onChange(Array.isArray(opt) ? opt.map((o) => o.value) : [])
    } else {
      onChange(opt ? opt.value : '')
    }
  }

  return (
    <div className={className}>
      <ReactSelect
        value={selected}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isMulti={isMulti}
        styles={customStyles}
        classNamePrefix="rs"
        unstyled={false}
        // Escapes any scrollable/overflow-hidden ancestor (e.g. a modal
        // body) by mounting the menu on <body> instead of inline — fixes
        // dropdowns getting visually clipped inside modals.
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    </div>
  )
}
