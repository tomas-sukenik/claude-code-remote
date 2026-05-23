export default function DetailPanel({ node, edges, nodeById, layers, onSelect, onClose }) {
  if (!node) {
    return (
      <aside className="arch-panel empty">
        <div className="arch-panel-empty">
          <div className="arch-panel-empty-icon" aria-hidden="true">◍</div>
          <h2>Explore the architecture</h2>
          <p>
            Click any box to inspect its responsibilities, tech, and connections.
            Hover to highlight what it talks to.
          </p>
        </div>
      </aside>
    )
  }

  const layer = layers[node.layer]
  const outgoing = edges
    .filter((e) => e.from === node.id)
    .map((e) => ({ ...e, node: nodeById[e.to] }))
  const incoming = edges
    .filter((e) => e.to === node.id)
    .map((e) => ({ ...e, node: nodeById[e.from] }))

  return (
    <aside className="arch-panel" style={{ '--layer-color': layer.color }}>
      <button className="arch-panel-close" onClick={onClose} aria-label="Close">×</button>

      <span className="arch-panel-badge">{layer.name}</span>
      <h2 className="arch-panel-title">{node.label}</h2>
      <p className="arch-panel-summary">{node.summary}</p>

      <div className="arch-panel-tags">
        {node.tech.map((t) => (
          <span key={t} className="arch-tag">{t}</span>
        ))}
      </div>

      <section className="arch-panel-section">
        <h3>Responsibilities</h3>
        <ul>
          {node.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      {outgoing.length > 0 && (
        <section className="arch-panel-section">
          <h3>Depends on / sends to</h3>
          <div className="arch-conn-list">
            {outgoing.map((e, i) => (
              <button key={i} className="arch-conn" onClick={() => onSelect(e.node.id)}>
                <span
                  className="arch-conn-dot"
                  style={{ background: layers[e.node.layer].color }}
                />
                <span className="arch-conn-name">{e.node.label}</span>
                {e.label && <span className="arch-conn-label">{e.label}</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {incoming.length > 0 && (
        <section className="arch-panel-section">
          <h3>Used by / receives from</h3>
          <div className="arch-conn-list">
            {incoming.map((e, i) => (
              <button key={i} className="arch-conn" onClick={() => onSelect(e.node.id)}>
                <span
                  className="arch-conn-dot"
                  style={{ background: layers[e.node.layer].color }}
                />
                <span className="arch-conn-name">{e.node.label}</span>
                {e.label && <span className="arch-conn-label">{e.label}</span>}
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}
