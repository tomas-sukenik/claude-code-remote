import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LAYERS, NODES, EDGES, NODE_W, NODE_H } from './data'
import DetailPanel from './DetailPanel'
import './canvas.css'

const MIN_SCALE = 0.25
const MAX_SCALE = 2.5

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

// Cubic bezier between two node centers, curving along the vertical axis so the
// top-down layout reads as clean flowing connectors.
function edgePath(s, t) {
  const sx = s.x + NODE_W / 2
  const sy = s.y + NODE_H / 2
  const tx = t.x + NODE_W / 2
  const ty = t.y + NODE_H / 2
  const my = (sy + ty) / 2
  return `M ${sx} ${sy} C ${sx} ${my}, ${tx} ${my}, ${tx} ${ty}`
}

export default function ArchitectureCanvas() {
  const viewportRef = useRef(null)
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(NODES.map((n) => [n.id, { x: n.x, y: n.y }])),
  )
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const [selectedId, setSelectedId] = useState(null)
  const [hoverId, setHoverId] = useState(null)
  const [activeLayers, setActiveLayers] = useState(
    () => new Set(Object.keys(LAYERS)),
  )
  const [animate, setAnimate] = useState(true)

  // Mutable interaction state — avoids re-renders during pointer moves.
  const drag = useRef(null)
  const moved = useRef(false)

  const nodeById = useMemo(
    () => Object.fromEntries(NODES.map((n) => [n.id, n])),
    [],
  )

  const visibleNodes = useMemo(
    () => NODES.filter((n) => activeLayers.has(n.layer)),
    [activeLayers],
  )
  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  )
  const visibleEdges = useMemo(
    () => EDGES.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [visibleIds],
  )

  // Set of node ids connected to the currently focused node (hover or select).
  const focusId = hoverId || selectedId
  const connectedIds = useMemo(() => {
    if (!focusId) return null
    const set = new Set([focusId])
    for (const e of EDGES) {
      if (e.from === focusId) set.add(e.to)
      if (e.to === focusId) set.add(e.from)
    }
    return set
  }, [focusId])

  const fitToView = useCallback(() => {
    const el = viewportRef.current
    if (!el || visibleNodes.length === 0) return
    const xs = visibleNodes.map((n) => positions[n.id].x)
    const ys = visibleNodes.map((n) => positions[n.id].y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs) + NODE_W
    const maxY = Math.max(...ys) + NODE_H
    const pad = 80
    const bw = maxX - minX + pad * 2
    const bh = maxY - minY + pad * 2
    const { clientWidth: vw, clientHeight: vh } = el
    const scale = clamp(Math.min(vw / bw, vh / bh), MIN_SCALE, MAX_SCALE)
    const x = (vw - (minX + maxX) * scale) / 2
    const y = (vh - (minY + maxY) * scale) / 2
    setView({ x, y, scale })
  }, [positions, visibleNodes])

  // Auto-fit once on mount.
  useEffect(() => {
    fitToView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Non-passive wheel listener so we can preventDefault to zoom toward cursor.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      setView((v) => {
        const factor = Math.exp(-e.deltaY * 0.0015)
        const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE)
        const wx = (px - v.x) / v.scale
        const wy = (py - v.y) / v.scale
        return { scale, x: px - wx * scale, y: py - wy * scale }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const zoomBy = useCallback((factor) => {
    const el = viewportRef.current
    if (!el) return
    const cx = el.clientWidth / 2
    const cy = el.clientHeight / 2
    setView((v) => {
      const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE)
      const wx = (cx - v.x) / v.scale
      const wy = (cy - v.y) / v.scale
      return { scale, x: cx - wx * scale, y: cy - wy * scale }
    })
  }, [])

  const onPointerDownBackground = (e) => {
    drag.current = {
      kind: 'pan',
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...view },
    }
    moved.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerDownNode = (e, id) => {
    e.stopPropagation()
    drag.current = {
      kind: 'node',
      id,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...positions[id] },
    }
    moved.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true
    if (d.kind === 'pan') {
      setView((v) => ({ ...v, x: d.origin.x + dx, y: d.origin.y + dy }))
    } else if (d.kind === 'node') {
      setPositions((p) => ({
        ...p,
        [d.id]: {
          x: d.origin.x + dx / view.scale,
          y: d.origin.y + dy / view.scale,
        },
      }))
    }
  }

  const endDrag = () => {
    drag.current = null
  }

  const onNodeClick = (e, id) => {
    e.stopPropagation()
    if (moved.current) return // was a drag, not a click
    setSelectedId((cur) => (cur === id ? null : id))
  }

  const onBackgroundClick = () => {
    if (moved.current) return
    setSelectedId(null)
  }

  const toggleLayer = (layerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layerId)) next.delete(layerId)
      else next.add(layerId)
      return next
    })
  }

  const selectedNode = selectedId ? nodeById[selectedId] : null

  return (
    <div className="arch-root">
      <header className="arch-header">
        <div className="arch-title">
          <span className="arch-logo" aria-hidden="true">◧</span>
          <div>
            <h1>Lumen Storefront</h1>
            <p>Frontend Architecture — interactive map</p>
          </div>
        </div>
        <div className="arch-hint">
          Drag to pan · scroll to zoom · drag a box to move it · click for details
        </div>
      </header>

      <div className="arch-stage">
        <div
          ref={viewportRef}
          className={`arch-viewport ${drag.current?.kind === 'pan' ? 'panning' : ''}`}
          onPointerDown={onPointerDownBackground}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={onBackgroundClick}
        >
          <div
            className="arch-world"
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            }}
          >
            <svg className="arch-edges" width="1500" height="1080">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {visibleEdges.map((e, i) => {
                const s = positions[e.from]
                const t = positions[e.to]
                const isFocus =
                  connectedIds &&
                  (e.from === focusId || e.to === focusId)
                const dim = connectedIds && !isFocus
                const cls = [
                  'arch-edge',
                  isFocus ? 'focus' : '',
                  dim ? 'dim' : '',
                  e.flow && animate ? 'flow' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <g key={i} className={cls}>
                    <path d={edgePath(s, t)} markerEnd="url(#arrow)" />
                  </g>
                )
              })}
            </svg>

            {visibleNodes.map((n) => {
              const pos = positions[n.id]
              const layer = LAYERS[n.layer]
              const isSelected = n.id === selectedId
              const dim = connectedIds && !connectedIds.has(n.id)
              return (
                <div
                  key={n.id}
                  className={`arch-node ${isSelected ? 'selected' : ''} ${dim ? 'dim' : ''}`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: NODE_W,
                    height: NODE_H,
                    '--layer-color': layer.color,
                  }}
                  onPointerDown={(e) => onPointerDownNode(e, n.id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onClick={(e) => onNodeClick(e, n.id)}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId((cur) => (cur === n.id ? null : cur))}
                >
                  <span className="arch-node-layer">{layer.name}</span>
                  <span className="arch-node-label">{n.label}</span>
                </div>
              )
            })}
          </div>

          <div className="arch-controls">
            <button onClick={() => zoomBy(1.2)} title="Zoom in" aria-label="Zoom in">+</button>
            <button onClick={() => zoomBy(1 / 1.2)} title="Zoom out" aria-label="Zoom out">−</button>
            <button onClick={fitToView} title="Fit to screen" aria-label="Fit to screen">⤢</button>
          </div>

          <div className="arch-zoom-readout">{Math.round(view.scale * 100)}%</div>
        </div>

        <DetailPanel
          node={selectedNode}
          edges={EDGES}
          nodeById={nodeById}
          layers={LAYERS}
          onSelect={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      </div>

      <footer className="arch-legend">
        <div className="arch-legend-layers">
          {Object.values(LAYERS).map((l) => {
            const on = activeLayers.has(l.id)
            return (
              <button
                key={l.id}
                className={`arch-chip ${on ? '' : 'off'}`}
                style={{ '--layer-color': l.color }}
                onClick={() => toggleLayer(l.id)}
                aria-pressed={on}
              >
                <span className="arch-chip-dot" />
                {l.name}
              </button>
            )
          })}
        </div>
        <label className="arch-flow-toggle">
          <input
            type="checkbox"
            checked={animate}
            onChange={(e) => setAnimate(e.target.checked)}
          />
          Animate data flow
        </label>
      </footer>
    </div>
  )
}
