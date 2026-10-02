"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Pan and zoom for VisitedMap's `zoomable` prop. The map itself is still
// rendered by the server and passed in as children; this only moves and scales
// it. Pins, tooltips and borders read --visited-map-zoom to keep their size.

const MIN_ZOOM = 1
// world-atlas 110m gets visibly coarse past this.
const MAX_ZOOM = 6
const STEP = 1.5
// Pixels a pointer must move before a press becomes a drag, so taps and clicks
// still reach the pins.
const DRAG_THRESHOLD = 3

/**
 * Scale `k` and translation `x`/`y`, stored as fractions of the map's size
 * (not pixels) so the view stays right when the map is resized.
 */
export type VisitedMapView = { k: number; x: number; y: number }

type View = VisitedMapView

const worldView: View = { k: 1, x: 0, y: 0 }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// Keeps the map covering the viewport: no empty space at the edges.
function constrain({ k, x, y }: View): View {
  const zoom = clamp(k, MIN_ZOOM, MAX_ZOOM)
  return {
    k: zoom,
    x: clamp(x, 1 - zoom, 0),
    y: clamp(y, 1 - zoom, 0),
  }
}

// Zooms to `k` keeping the point (u, v) of the viewport, as fractions of its
// size, under the cursor or fingers.
function zoomAt(view: View, k: number, u: number, v: number): View {
  const zoom = clamp(k, MIN_ZOOM, MAX_ZOOM)
  return constrain({
    k: zoom,
    x: u - ((u - view.x) / view.k) * zoom,
    y: v - ((v - view.y) / view.k) * zoom,
  })
}

type Pointer = { x: number; y: number }

function distance(a: Pointer, b: Pointer) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Pointer, b: Pointer): Pointer {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      {children}
    </svg>
  )
}

function ZoomButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function VisitedMapZoom({
  initialView = worldView,
  children,
}: {
  /** Where the map starts, e.g. framing the `focus` country. */
  initialView?: View
  children: React.ReactNode
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [view, setView] = React.useState<View>(initialView)
  // Buttons and double-click animate; wheel, drag and pinch follow the input.
  const [animate, setAnimate] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [hint, setHint] = React.useState<string | null>(null)

  const viewRef = React.useRef(view)
  const pointers = React.useRef(new Map<number, Pointer>())
  const gesture = React.useRef<{
    start: Pointer
    last: Pointer
    distance: number
    moved: boolean
  } | null>(null)

  const update = React.useCallback((next: View, animated: boolean) => {
    viewRef.current = next
    setAnimate(animated)
    setView(next)
  }, [])

  // Viewport-relative position of a client point, as fractions of its size.
  const toFraction = React.useCallback((point: Pointer) => {
    const rect = viewportRef.current!.getBoundingClientRect()
    return {
      u: (point.x - rect.left) / rect.width,
      v: (point.y - rect.top) / rect.height,
      rect,
    }
  }, [])

  // A native listener: React's onWheel is passive and can't stop the page from
  // scrolling. The wheel only zooms with ⌘/Ctrl (trackpad pinch sends Ctrl),
  // so scrolling past the map still scrolls the page.
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    let hintTimer: ReturnType<typeof setTimeout> | undefined

    function onWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        const mac = /Mac|iPhone|iPad/.test(navigator.userAgent)
        setHint(`Use ${mac ? "⌘" : "Ctrl"} + scroll to zoom`)
        clearTimeout(hintTimer)
        hintTimer = setTimeout(() => setHint(null), 1200)
        return
      }
      event.preventDefault()
      setHint(null)
      const { u, v } = toFraction({ x: event.clientX, y: event.clientY })
      const delta = clamp(event.deltaY, -50, 50)
      const current = viewRef.current
      update(zoomAt(current, current.k * Math.exp(-delta * 0.01), u, v), false)
    }

    viewport.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      viewport.removeEventListener("wheel", onWheel)
      clearTimeout(hintTimer)
    }
  }, [toFraction, update])

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    const points = [...pointers.current.values()]
    const center =
      points.length > 1 ? midpoint(points[0], points[1]) : points[0]
    gesture.current = {
      start: center,
      last: center,
      distance: points.length > 1 ? distance(points[0], points[1]) : 0,
      moved: points.length > 1,
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    const points = [...pointers.current.values()]
    const current = viewRef.current
    const state = gesture.current

    if (points.length > 1) {
      // Pinch: scale by the change in finger distance around their midpoint,
      // and pan by how far the midpoint moved.
      const center = midpoint(points[0], points[1])
      const spread = distance(points[0], points[1])
      const { u, v, rect } = toFraction(center)
      const scaled = zoomAt(
        current,
        current.k * (state.distance ? spread / state.distance : 1),
        u,
        v,
      )
      update(
        constrain({
          ...scaled,
          x: scaled.x + (center.x - state.last.x) / rect.width,
          y: scaled.y + (center.y - state.last.y) / rect.height,
        }),
        false,
      )
      state.last = center
      state.distance = spread
      return
    }

    // One pointer only pans once zoomed in; at 1× the page scrolls instead.
    if (current.k === 1) return
    const point = points[0]
    if (!state.moved && distance(point, state.start) < DRAG_THRESHOLD) return
    if (!state.moved) {
      state.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    const { rect } = toFraction(point)
    update(
      constrain({
        ...current,
        x: current.x + (point.x - state.last.x) / rect.width,
        y: current.y + (point.y - state.last.y) / rect.height,
      }),
      false,
    )
    state.last = point
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId)
    const rest = [...pointers.current.values()]
    // Lifting one finger of a pinch continues as a pan from the other one.
    gesture.current = rest.length
      ? { start: rest[0], last: rest[0], distance: 0, moved: true }
      : null
    if (!rest.length) setDragging(false)
  }

  function onDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    const { u, v } = toFraction({ x: event.clientX, y: event.clientY })
    update(zoomAt(viewRef.current, viewRef.current.k * 2, u, v), true)
  }

  // Buttons zoom around the center of the viewport.
  function zoomBy(factor: number) {
    update(zoomAt(viewRef.current, viewRef.current.k * factor, 0.5, 0.5), true)
  }

  const zoomed = view.k > 1
  // Reset goes back to where the map started (the focused country, if any).
  const atStart =
    view.k === initialView.k &&
    view.x === initialView.x &&
    view.y === initialView.y

  return (
    <>
      <div
        ref={viewportRef}
        data-slot="visited-map-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        className={cn(
          "relative overflow-hidden rounded-lg select-none",
          // At 1× one finger scrolls the page; zoomed in, it pans the map.
          zoomed ? "touch-none" : "touch-pan-x touch-pan-y",
          zoomed && (dragging ? "cursor-grabbing" : "cursor-grab"),
        )}
      >
        <div
          className={cn(
            "relative origin-top-left",
            animate && "transition-transform duration-300 ease-out",
          )}
          style={
            {
              transform: `translate(${view.x * 100}%, ${view.y * 100}%) scale(${view.k})`,
              "--visited-map-zoom": view.k,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </div>
      {/* Covers the whole card, not just the map: on narrow maps the card is
          taller than the map. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-30 flex rounded-lg items-center justify-center bg-background/40 text-sm font-medium opacity-0 transition-opacity",
          hint && "opacity-100",
        )}
      >
        <span className="rounded-md border bg-popover px-2.5 py-1 text-popover-foreground shadow-sm">
          {hint}
        </span>
      </div>
      <div
        role="group"
        aria-label="Zoom"
        className="absolute right-2 bottom-2 z-20 flex flex-col divide-y overflow-hidden rounded-md border bg-card/80 shadow-sm backdrop-blur-sm"
      >
        <ZoomButton
          label="Zoom in"
          disabled={view.k >= MAX_ZOOM}
          onClick={() => zoomBy(STEP)}
        >
          <Icon>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </Icon>
        </ZoomButton>
        <ZoomButton
          label="Zoom out"
          disabled={!zoomed}
          onClick={() => zoomBy(1 / STEP)}
        >
          <Icon>
            <path d="M5 12h14" />
          </Icon>
        </ZoomButton>
        <ZoomButton
          label="Reset zoom"
          disabled={atStart}
          onClick={() => update(initialView, true)}
        >
          <Icon>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </Icon>
        </ZoomButton>
      </div>
    </>
  )
}
