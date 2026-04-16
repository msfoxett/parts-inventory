import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabase.js'

const BRAND_COLORS = {
  GE: '#1a6b3c', LG: '#a50034', SAMSUNG: '#1428a0',
  WHIRLPOOL: '#004b87', FRIGIDAIRE: '#e5501e', UNKNOWN: '#475569'
}

const STATUS_COLORS = {
  LISTED: '#166534', 'NOT LISTING': '#7c2d12',
  PICTURE: '#1e3a5f', 'NEED IMAGE': '#713f12', 'NOT LSITING': '#7c2d12'
}

const BRANDS = ['GE', 'LG', 'SAMSUNG', 'WHIRLPOOL', 'FRIGIDAIRE', 'UNKNOWN']
const STATUSES = ['LISTED', 'NOT LISTING', 'PICTURE', 'NEED IMAGE', '']

function Toast({ message, type }) {
  if (!message) return null
  const colors = { success: '#166534', error: '#7c2d12', info: '#1e3a5f' }
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: colors[type] || colors.info, color: '#fff',
      padding: '12px 20px', borderRadius: 6, fontSize: 13,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)', animation: 'fadein 0.2s ease'
    }}>
      {message}
    </div>
  )
}

function SortIcon({ active, dir }) {
  return <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3, fontSize: 10 }}>
    {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
  </span>
}

const EMPTY_FORM = {
  trailer: '1', location: '', box: '', part: '', description: '',
  dey_price: '', ebay_status: 'NOT LISTING', price: '', date_listed: '', brand: 'UNKNOWN'
}

function Modal({ part, onSave, onClose, saving }) {
  const [form, setForm] = useState(part ? {
    trailer: part.trailer || '1',
    location: part.location || '',
    box: part.box || '',
    part: part.part || '',
    description: part.description || '',
    dey_price: part.dey_price ?? '',
    ebay_status: part.ebay_status || '',
    price: part.price ?? '',
    date_listed: part.date_listed || '',
    brand: part.brand || 'UNKNOWN'
  } : { ...EMPTY_FORM })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const inp = {
    background: '#1a1a2e', color: '#e2e8f0', border: '1px solid #334155',
    borderRadius: 4, padding: '7px 10px', width: '100%',
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 13
  }
  const lbl = {
    display: 'block', marginBottom: 4, fontSize: 11,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1
  }
  const fld = { marginBottom: 14 }

  const handleSubmit = () => {
    if (!form.part.trim() && !form.description.trim()) return
    onSave({
      ...form,
      dey_price: form.dey_price !== '' ? parseFloat(form.dey_price) : null,
      price: form.price !== '' ? parseFloat(form.price) : null,
      date_listed: form.date_listed || null,
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
        padding: 28, width: 540, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#f59e0b', fontSize: 16, letterSpacing: 2 }}>
            {part ? 'EDIT PART' : 'ADD NEW PART'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Part Number *</label>
            <input style={inp} value={form.part} onChange={set('part')} placeholder="e.g. WB27X38606" />
          </div>
          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Description *</label>
            <input style={inp} value={form.description} onChange={set('description')} placeholder="e.g. DISPLAY BOARD ASM" />
          </div>
          <div style={fld}>
            <label style={lbl}>Brand</label>
            <select style={inp} value={form.brand} onChange={set('brand')}>
              {BRANDS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div style={fld}>
            <label style={lbl}>eBay Status</label>
            <select style={inp} value={form.ebay_status} onChange={set('ebay_status')}>
              {STATUSES.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}
            </select>
          </div>
          <div style={fld}>
            <label style={lbl}>Location</label>
            <input style={inp} value={form.location} onChange={set('location')} placeholder="e.g. 10A" />
          </div>
          <div style={fld}>
            <label style={lbl}>Box</label>
            <input style={inp} value={form.box} onChange={set('box')} placeholder="e.g. A, B-1" />
          </div>
          <div style={fld}>
            <label style={lbl}>Trailer</label>
            <input style={inp} value={form.trailer} onChange={set('trailer')} placeholder="1" />
          </div>
          <div style={fld}>
            <label style={lbl}>Date Listed</label>
            <input style={{ ...inp }} type="date" value={form.date_listed} onChange={set('date_listed')} />
          </div>
          <div style={fld}>
            <label style={lbl}>Dey Price ($)</label>
            <input style={inp} type="number" step="0.01" value={form.dey_price} onChange={set('dey_price')} placeholder="0.00" />
          </div>
          <div style={fld}>
            <label style={lbl}>eBay Price ($)</label>
            <input style={inp} type="number" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', background: '#1e293b', border: '1px solid #334155',
            color: '#94a3b8', borderRadius: 4, cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding: '8px 24px', background: saving ? '#92400e' : '#f59e0b',
            border: 'none', color: '#000', borderRadius: 4, cursor: 'pointer',
            fontWeight: 700, letterSpacing: 1
          }}>
            {saving ? 'SAVING...' : (part ? 'SAVE CHANGES' : 'ADD PART')}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({ part, onConfirm, onCancel, deleting }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #dc2626', borderRadius: 8,
        padding: 32, width: 400, textAlign: 'center'
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ color: '#fca5a5', marginBottom: 8, letterSpacing: 1 }}>DELETE PART?</h3>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
          <strong style={{ color: '#fbbf24' }}>{part.part}</strong>
        </p>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 24 }}>{part.description}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '8px 20px', background: '#1e293b', border: '1px solid #334155',
            color: '#94a3b8', borderRadius: 4, cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{
            padding: '8px 24px', background: deleting ? '#991b1b' : '#dc2626',
            border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontWeight: 700
          }}>
            {deleting ? 'DELETING...' : 'YES, DELETE'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [sortKey, setSortKey] = useState('location')
  const [sortDir, setSortDir] = useState('asc')
  const [showModal, setShowModal] = useState(false)
  const [editPart, setEditPart] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load all parts from Supabase
  const fetchParts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('location', { ascending: true })
    if (error) {
      showToast('Failed to load parts: ' + error.message, 'error')
    } else {
      setParts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchParts() }, [fetchParts])

  // Real-time updates — any change by anyone refreshes the list
  useEffect(() => {
    const channel = supabase
      .channel('parts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, () => {
        fetchParts()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchParts])

  // Add or update a part
  const handleSave = async (formData) => {
    setSaving(true)
    if (editPart) {
      const { error } = await supabase
        .from('parts')
        .update(formData)
        .eq('id', editPart.id)
      if (error) showToast('Update failed: ' + error.message, 'error')
      else showToast('Part updated successfully!')
    } else {
      const { error } = await supabase.from('parts').insert([formData])
      if (error) showToast('Add failed: ' + error.message, 'error')
      else showToast('Part added successfully!')
    }
    setSaving(false)
    setShowModal(false)
    setEditPart(null)
    fetchParts()
  }

  // Delete a part
  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('parts').delete().eq('id', deleteTarget.id)
    if (error) showToast('Delete failed: ' + error.message, 'error')
    else showToast('Part deleted.')
    setDeleting(false)
    setDeleteTarget(null)
    fetchParts()
  }

  // Filtering + sorting (client-side for speed)
  const allBrands = useMemo(() => {
    const b = new Set(parts.map(p => p.brand).filter(Boolean))
    return ['ALL', ...Array.from(b).sort()]
  }, [parts])

  const allStatuses = useMemo(() => {
    const s = new Set(parts.map(p => p.ebay_status).filter(Boolean))
    return ['ALL', ...Array.from(s).sort()]
  }, [parts])

  const filtered = useMemo(() => {
    let r = parts
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(p =>
        (p.part || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q)
      )
    }
    if (filterBrand !== 'ALL') r = r.filter(p => p.brand === filterBrand)
    if (filterStatus !== 'ALL') r = r.filter(p => p.ebay_status === filterStatus)
    return [...r].sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [parts, search, filterBrand, filterStatus, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const th = (key, label) => ({
    style: {
      padding: '10px 12px', cursor: 'pointer', userSelect: 'none',
      background: sortKey === key ? '#1e293b' : 'transparent',
      color: sortKey === key ? '#f59e0b' : '#94a3b8',
      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: 1, whiteSpace: 'nowrap', borderBottom: '2px solid #1e293b',
      textAlign: 'left'
    },
    onClick: () => handleSort(key)
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 32 }}>⚙️</div>
      <div style={{ color: '#f59e0b', fontSize: 16, letterSpacing: 2 }}>LOADING INVENTORY...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: '#0f172a', borderBottom: '2px solid #f59e0b',
        padding: '14px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#f59e0b', letterSpacing: 3, marginBottom: 2 }}>
            TRAILER 1 — REAL-TIME SHARED INVENTORY
          </div>
          <h1 style={{ fontSize: 18, color: '#f8fafc', letterSpacing: 2 }}>
            APPLIANCE PARTS INVENTORY
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, color: '#f59e0b', fontWeight: 700 }}>{filtered.length.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1 }}>OF {parts.length.toLocaleString()} PARTS</div>
          </div>
          <button
            onClick={() => { setEditPart(null); setShowModal(true) }}
            style={{
              background: '#f59e0b', color: '#000', border: 'none',
              padding: '10px 20px', borderRadius: 4, cursor: 'pointer',
              fontWeight: 700, fontSize: 13, letterSpacing: 1
            }}>
            + ADD PART
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        padding: '12px 24px', background: '#0f172a',
        borderBottom: '1px solid #1e293b', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <input
          placeholder="🔍  Search part #, description, or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: '#1a1a2e', border: '1px solid #334155', color: '#e2e8f0',
            padding: '8px 14px', borderRadius: 4, fontSize: 13, minWidth: 300, flex: 1
          }}
        />
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{
          background: '#1a1a2e', border: '1px solid #334155', color: '#e2e8f0',
          padding: '8px 12px', borderRadius: 4, fontSize: 12
        }}>
          {allBrands.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
          background: '#1a1a2e', border: '1px solid #334155', color: '#e2e8f0',
          padding: '8px 12px', borderRadius: 4, fontSize: 12
        }}>
          {allStatuses.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterBrand !== 'ALL' || filterStatus !== 'ALL') && (
          <button
            onClick={() => { setSearch(''); setFilterBrand('ALL'); setFilterStatus('ALL') }}
            style={{
              background: '#1e293b', border: '1px solid #475569', color: '#94a3b8',
              padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12
            }}>
            ✕ Clear
          </button>
        )}
        <button onClick={fetchParts} style={{
          background: '#1e293b', border: '1px solid #334155', color: '#64748b',
          padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12
        }}>↻ Refresh</button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead style={{ position: 'sticky', top: '65px', zIndex: 50, background: '#0a0f1e' }}>
            <tr>
              <th {...th('part', 'Part #')} />
              <th {...th('description', 'Description')} />
              <th {...th('brand', 'Brand')} />
              <th {...th('location', 'Loc')} />
              <th {...th('box', 'Box')} />
              <th {...th('trailer', 'TR')} />
              <th {...th('dey_price', 'Dey $')} style={{ ...th('dey_price', 'Dey $').style, textAlign: 'right' }} />
              <th {...th('ebay_status', 'Status')} />
              <th {...th('price', 'eBay $')} style={{ ...th('price', 'eBay $').style, textAlign: 'right' }} />
              <th {...th('date_listed', 'Listed')} />
              <th style={{ padding: '10px 12px', color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #1e293b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #111827' }}
                onMouseEnter={e => e.currentTarget.style.background = '#111827'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '8px 12px', color: '#fbbf24', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.part}</td>
                <td style={{ padding: '8px 12px', color: '#e2e8f0', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={p.description}>{p.description}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    background: BRAND_COLORS[p.brand] || '#334155',
                    color: '#fff', padding: '2px 7px', borderRadius: 3,
                    fontSize: 10, fontWeight: 700, letterSpacing: 1
                  }}>{p.brand || '—'}</span>
                </td>
                <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{p.location}</td>
                <td style={{ padding: '8px 12px', color: '#64748b' }}>{p.box}</td>
                <td style={{ padding: '8px 12px', color: '#64748b', textAlign: 'center' }}>{p.trailer}</td>
                <td style={{ padding: '8px 12px', color: '#94a3b8', textAlign: 'right' }}>
                  {p.dey_price != null ? `$${Number(p.dey_price).toFixed(2)}` : '—'}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  {p.ebay_status ? (
                    <span style={{
                      background: STATUS_COLORS[p.ebay_status] || '#1e293b',
                      color: '#fff', padding: '2px 7px', borderRadius: 3,
                      fontSize: 10, fontWeight: 600
                    }}>{p.ebay_status}</span>
                  ) : '—'}
                </td>
                <td style={{ padding: '8px 12px', color: '#4ade80', textAlign: 'right', fontWeight: 600 }}>
                  {p.price != null ? `$${Number(p.price).toFixed(2)}` : '—'}
                </td>
                <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {p.date_listed || '—'}
                </td>
                <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => { setEditPart(p); setShowModal(true) }}
                    style={{
                      background: '#1e3a5f', color: '#93c5fd', border: 'none',
                      padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
                      fontSize: 11, marginRight: 6
                    }}>EDIT</button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    style={{
                      background: '#3b0a0a', color: '#fca5a5', border: 'none',
                      padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontSize: 11
                    }}>DEL</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#475569' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div>No parts found. Try adjusting your search or filters.</div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <Modal
          part={editPart}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditPart(null) }}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          part={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
