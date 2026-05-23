// Fictional reference architecture for "Lumen" — a modern e-commerce storefront.
// Used purely to demonstrate the interactive canvas. None of the tech choices
// imply a real system; they're representative of a typical production frontend.

export const LAYERS = {
  entry: { id: 'entry', name: 'Entry & Delivery', color: '#38bdf8' },
  shell: { id: 'shell', name: 'App Shell', color: '#a78bfa' },
  feature: { id: 'feature', name: 'Feature Modules', color: '#34d399' },
  ui: { id: 'ui', name: 'UI & Design System', color: '#f472b6' },
  data: { id: 'data', name: 'State & Data', color: '#fbbf24' },
  platform: { id: 'platform', name: 'Cross-Cutting Platform', color: '#2dd4bf' },
}

// Node box geometry (world units). Positions are top-left corners.
export const NODE_W = 184
export const NODE_H = 78

export const NODES = [
  // --- Entry & Delivery ---
  {
    id: 'browser',
    label: 'User Browser',
    layer: 'entry',
    x: 620, y: 40,
    tech: ['HTML', 'HTTP/3', 'WebAssembly'],
    summary: 'The end-user runtime. Requests the document, downloads assets, and runs the hydrated app.',
    responsibilities: [
      'Initial document + asset requests',
      'Executes the JS bundle and runs the SPA',
      'Hosts the Service Worker and caches',
    ],
  },
  {
    id: 'cdn',
    label: 'CDN / Edge Network',
    layer: 'entry',
    x: 240, y: 40,
    tech: ['Cloudflare', 'Edge Functions', 'Brotli'],
    summary: 'Globally distributed cache for static assets and edge-rendered responses, close to the user.',
    responsibilities: [
      'Serves hashed JS/CSS/image bundles',
      'Edge redirects, A/B routing, geo headers',
      'Caches SSR/ISR HTML at the edge',
    ],
  },
  {
    id: 'sw',
    label: 'Service Worker (PWA)',
    layer: 'platform',
    x: 1000, y: 40,
    tech: ['Workbox', 'Cache API', 'Background Sync'],
    summary: 'Intercepts network requests for offline support, asset precaching, and install prompts.',
    responsibilities: [
      'Precaches the app shell for offline use',
      'Stale-while-revalidate for product images',
      'Queues failed mutations for background sync',
    ],
  },

  // --- App Shell ---
  {
    id: 'shell',
    label: 'App Shell (Next.js)',
    layer: 'shell',
    x: 620, y: 196,
    tech: ['Next.js', 'React 19', 'TypeScript'],
    summary: 'The application root. Bootstraps providers, owns layout, and orchestrates every other module.',
    responsibilities: [
      'Mounts global providers (theme, store, query)',
      'Defines the persistent layout shell',
      'Wires cross-cutting platform concerns',
    ],
  },
  {
    id: 'router',
    label: 'Client Router',
    layer: 'shell',
    x: 430, y: 320,
    tech: ['App Router', 'Route Segments', 'Suspense'],
    summary: 'Maps URLs to feature modules with code-splitting and streaming boundaries.',
    responsibilities: [
      'Lazy-loads feature bundles per route',
      'Defines Suspense + error boundaries',
      'Prefetches likely next routes on hover',
    ],
  },
  {
    id: 'ssr',
    label: 'SSR & Hydration',
    layer: 'shell',
    x: 810, y: 320,
    tech: ['RSC', 'Streaming SSR', 'Hydration'],
    summary: 'Renders the first paint on the server and progressively hydrates interactive islands.',
    responsibilities: [
      'Server-renders above-the-fold HTML',
      'Streams server components to the client',
      'Selective hydration of interactive parts',
    ],
  },

  // --- Feature Modules ---
  {
    id: 'catalog',
    label: 'Product Catalog',
    layer: 'feature',
    x: 40, y: 470,
    tech: ['Virtualized Grid', 'ISR'],
    summary: 'Browse and view products, categories, and detail pages with rich media.',
    responsibilities: [
      'Category + product detail pages',
      'Image galleries and variant pickers',
      'Recently-viewed and recommendations',
    ],
  },
  {
    id: 'search',
    label: 'Search & Filters',
    layer: 'feature',
    x: 270, y: 470,
    tech: ['Algolia', 'Debounced Query', 'Facets'],
    summary: 'Instant search with faceted filtering, sorting, and typo tolerance.',
    responsibilities: [
      'Typeahead suggestions',
      'Faceted filter + sort state in the URL',
      'Search analytics events',
    ],
  },
  {
    id: 'cart',
    label: 'Cart',
    layer: 'feature',
    x: 500, y: 470,
    tech: ['Optimistic UI', 'Local + Server'],
    summary: 'Add/update/remove line items with optimistic updates and cross-device sync.',
    responsibilities: [
      'Optimistic line-item mutations',
      'Promo codes and price recalculation',
      'Persists guest carts locally',
    ],
  },
  {
    id: 'checkout',
    label: 'Checkout',
    layer: 'feature',
    x: 730, y: 470,
    tech: ['Stripe Elements', 'Multi-step'],
    summary: 'Multi-step purchase flow: address, shipping, payment, and confirmation.',
    responsibilities: [
      'PCI-scoped payment iframe (Stripe)',
      'Address validation + shipping rates',
      'Order placement and confirmation',
    ],
  },
  {
    id: 'account',
    label: 'User Account',
    layer: 'feature',
    x: 960, y: 470,
    tech: ['Orders', 'Wishlists', 'Profile'],
    summary: 'Authenticated area for orders, addresses, payment methods, and preferences.',
    responsibilities: [
      'Order history + tracking',
      'Saved addresses and cards',
      'Notification + privacy settings',
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews & Q&A',
    layer: 'feature',
    x: 1190, y: 470,
    tech: ['UGC', 'Moderation', 'Media'],
    summary: 'User-generated ratings, written reviews, photos, and product questions.',
    responsibilities: [
      'Star ratings + review submission',
      'Photo/video upload with preview',
      'Helpfulness voting and reporting',
    ],
  },

  // --- UI & Design System ---
  {
    id: 'designsys',
    label: 'Design System',
    layer: 'ui',
    x: 150, y: 648,
    tech: ['Radix', 'CVA', 'Storybook'],
    summary: 'Shared, accessible component library consumed by every feature module.',
    responsibilities: [
      'Accessible primitives (modal, menu, form)',
      'Composable, themeable components',
      'Documented + tested in Storybook',
    ],
  },
  {
    id: 'tokens',
    label: 'Design Tokens / Theme',
    layer: 'ui',
    x: 150, y: 784,
    tech: ['CSS Vars', 'Style Dictionary'],
    summary: 'Single source of truth for color, spacing, and typography across light/dark themes.',
    responsibilities: [
      'Platform-agnostic token definitions',
      'Light/dark + brand theming',
      'Generated CSS variables',
    ],
  },

  // --- State & Data ---
  {
    id: 'store',
    label: 'Global Store (Zustand)',
    layer: 'data',
    x: 450, y: 648,
    tech: ['Zustand', 'Immer', 'Selectors'],
    summary: 'Client-side UI and session state shared across features (cart drawer, toasts, user prefs).',
    responsibilities: [
      'Ephemeral UI + cross-feature state',
      'Derived selectors and middleware',
      'Persistence to localStorage',
    ],
  },
  {
    id: 'cache',
    label: 'Server Cache (React Query)',
    layer: 'data',
    x: 730, y: 648,
    tech: ['TanStack Query', 'SWR pattern'],
    summary: 'Caches, dedupes, and revalidates server data; the read path for all remote resources.',
    responsibilities: [
      'Request dedupe + background refetch',
      'Optimistic updates + rollback',
      'Cache invalidation by tag',
    ],
  },
  {
    id: 'realtime',
    label: 'Realtime (WebSocket)',
    layer: 'data',
    x: 1010, y: 648,
    tech: ['WebSocket', 'SSE fallback'],
    summary: 'Live updates for stock levels, price changes, and order status pushed from the server.',
    responsibilities: [
      'Subscribes to product/order channels',
      'Pushes deltas into the cache + store',
      'Reconnect with backoff',
    ],
  },
  {
    id: 'apiclient',
    label: 'API Client (GraphQL BFF)',
    layer: 'data',
    x: 730, y: 784,
    tech: ['GraphQL', 'BFF', 'Codegen'],
    summary: 'Typed gateway to the backend-for-frontend; the single egress point for all queries/mutations.',
    responsibilities: [
      'Typed operations from schema codegen',
      'Auth header injection + retries',
      'Error normalization + tracing',
    ],
  },

  // --- Cross-Cutting Platform ---
  {
    id: 'auth',
    label: 'Auth & Session',
    layer: 'platform',
    x: 150, y: 924,
    tech: ['OAuth2', 'OIDC', 'Refresh'],
    summary: 'Manages login, tokens, and session lifecycle; gatekeeper for protected features.',
    responsibilities: [
      'Login / logout / silent refresh',
      'Token storage + rotation',
      'Route + action authorization',
    ],
  },
  {
    id: 'flags',
    label: 'Feature Flags',
    layer: 'platform',
    x: 400, y: 924,
    tech: ['LaunchDarkly', 'Targeting'],
    summary: 'Runtime gating of features for rollouts, experiments, and kill switches.',
    responsibilities: [
      'Percentage + targeted rollouts',
      'A/B experiment assignment',
      'Instant kill switches',
    ],
  },
  {
    id: 'i18n',
    label: 'i18n / Localization',
    layer: 'platform',
    x: 650, y: 924,
    tech: ['ICU', 'Lazy Locales'],
    summary: 'Locale-aware copy, number/date/currency formatting, and right-to-left support.',
    responsibilities: [
      'Lazy-loaded message catalogs',
      'Currency + date formatting',
      'RTL layout switching',
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Telemetry',
    layer: 'platform',
    x: 900, y: 924,
    tech: ['Segment', 'Web Vitals'],
    summary: 'Captures product events and performance metrics for dashboards and experimentation.',
    responsibilities: [
      'Typed event tracking',
      'Core Web Vitals reporting',
      'Conversion funnel instrumentation',
    ],
  },
  {
    id: 'errors',
    label: 'Error Monitoring',
    layer: 'platform',
    x: 1150, y: 924,
    tech: ['Sentry', 'Source Maps'],
    summary: 'Captures runtime errors and traces with release + user context for triage.',
    responsibilities: [
      'Client error + unhandled rejection capture',
      'Performance traces and breadcrumbs',
      'Release health + alerting',
    ],
  },
]

// Edges describe dependency / data-flow direction (from -> to).
// `flow: true` marks animated "live data" paths.
export const EDGES = [
  // entry & delivery
  { from: 'browser', to: 'cdn', label: 'fetch assets' },
  { from: 'cdn', to: 'shell', label: 'serve bundle', flow: true },
  { from: 'browser', to: 'shell', label: 'boot', flow: true },
  { from: 'sw', to: 'browser', label: 'intercept' },

  // shell orchestration
  { from: 'shell', to: 'router' },
  { from: 'shell', to: 'ssr' },
  { from: 'shell', to: 'auth' },
  { from: 'shell', to: 'flags' },
  { from: 'shell', to: 'i18n' },
  { from: 'shell', to: 'analytics' },
  { from: 'shell', to: 'errors' },

  // routing to features
  { from: 'router', to: 'catalog' },
  { from: 'router', to: 'search' },
  { from: 'router', to: 'cart' },
  { from: 'router', to: 'checkout' },
  { from: 'router', to: 'account' },
  { from: 'router', to: 'reviews' },

  // features -> design system
  { from: 'catalog', to: 'designsys' },
  { from: 'cart', to: 'designsys' },
  { from: 'checkout', to: 'designsys' },
  { from: 'reviews', to: 'designsys' },
  { from: 'designsys', to: 'tokens' },
  { from: 'i18n', to: 'designsys', label: 'strings' },

  // features -> state/data
  { from: 'catalog', to: 'cache', label: 'read' },
  { from: 'search', to: 'cache', label: 'query' },
  { from: 'reviews', to: 'cache' },
  { from: 'account', to: 'cache' },
  { from: 'cart', to: 'store', label: 'ui state' },
  { from: 'cart', to: 'cache', label: 'mutate' },
  { from: 'checkout', to: 'store' },
  { from: 'checkout', to: 'cache', label: 'place order' },

  // data layer internals
  { from: 'cache', to: 'apiclient', label: 'queries', flow: true },
  { from: 'store', to: 'apiclient', label: 'mutations' },
  { from: 'realtime', to: 'cache', label: 'push', flow: true },
  { from: 'realtime', to: 'store', flow: true },
  { from: 'apiclient', to: 'auth', label: 'token' },
  { from: 'apiclient', to: 'errors', label: 'report' },

  // platform gating
  { from: 'flags', to: 'checkout', label: 'gate' },
  { from: 'auth', to: 'account' },
  { from: 'auth', to: 'checkout' },
  { from: 'analytics', to: 'catalog' },
  { from: 'analytics', to: 'checkout' },
]
