<script lang="ts">
  import { onMount, type Snippet } from 'svelte'

  interface Props {
    children: Snippet
    class?: string
    ariaLabel?: string
  }

  let { children, class: className = '', ariaLabel = '滚动内容' }: Props = $props()
  const componentId = $props.id()
  const viewportId = `${componentId}-viewport`
  type Axis = 'x' | 'y'
  let viewport: HTMLDivElement
  let content: HTMLDivElement
  let horizontal: HTMLDivElement
  let vertical: HTMLDivElement
  let width = $state(0)
  let height = $state(0)
  let scrollWidth = $state(0)
  let scrollHeight = $state(0)
  let left = $state(0)
  let top = $state(0)
  let trackWidth = $state(0)
  let trackHeight = $state(0)
  let dragging = $state<Axis | null>(null)
  let drag: { axis: Axis; pointerId: number; start: number; offset: number } | null = null

  const maxX = $derived(Math.max(0, scrollWidth - width))
  const maxY = $derived(Math.max(0, scrollHeight - height))
  const thumbWidth = $derived(Math.min(trackWidth, Math.max(24, trackWidth * width / (scrollWidth || 1))))
  const thumbHeight = $derived(Math.min(trackHeight, Math.max(24, trackHeight * height / (scrollHeight || 1))))
  const thumbLeft = $derived(maxX ? left / maxX * (trackWidth - thumbWidth) : 0)
  const thumbTop = $derived(maxY ? top / maxY * (trackHeight - thumbHeight) : 0)

  function measure() {
    width = viewport.clientWidth
    height = viewport.clientHeight
    scrollWidth = viewport.scrollWidth
    scrollHeight = viewport.scrollHeight
    trackWidth = horizontal.clientWidth
    trackHeight = vertical.clientHeight
    syncScroll()
  }

  function syncScroll() {
    left = Math.max(0, Math.min(maxX, viewport.scrollLeft))
    top = Math.max(0, Math.min(maxY, viewport.scrollTop))
  }

  function setPosition(axis: Axis, value: number) {
    const position = Math.max(0, Math.min(axis === 'x' ? maxX : maxY, value))
    viewport.scrollTo({ [axis === 'x' ? 'left' : 'top']: position, behavior: 'instant' })
    syncScroll()
  }

  function pointerDown(event: PointerEvent, axis: Axis) {
    if (!event.isPrimary || event.button !== 0 || drag) return
    const track = event.currentTarget as HTMLDivElement
    const rect = track.getBoundingClientRect()
    const coordinate = axis === 'x' ? event.clientX : event.clientY
    const local = coordinate - (axis === 'x' ? rect.left : rect.top)
    const offset = axis === 'x' ? thumbLeft : thumbTop
    const size = axis === 'x' ? thumbWidth : thumbHeight
    const travel = (axis === 'x' ? trackWidth : trackHeight) - size
    event.preventDefault()
    track.focus({ preventScroll: true })
    if (local < offset || local > offset + size) {
      if (travel > 0) setPosition(axis, (local - size / 2) / travel * (axis === 'x' ? maxX : maxY))
      return
    }
    track.setPointerCapture(event.pointerId)
    drag = { axis, pointerId: event.pointerId, start: coordinate, offset: axis === 'x' ? left : top }
    dragging = axis
  }

  function pointerMove(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return
    const { axis, start, offset } = drag
    const travel = axis === 'x' ? trackWidth - thumbWidth : trackHeight - thumbHeight
    if (travel <= 0) return
    const delta = (axis === 'x' ? event.clientX : event.clientY) - start
    setPosition(axis, offset + delta / travel * (axis === 'x' ? maxX : maxY))
  }

  function pointerEnd(event: PointerEvent) {
    if (drag?.pointerId !== event.pointerId) return
    drag = null
    dragging = null
    const track = event.currentTarget as HTMLDivElement
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId)
  }

  function keyDown(event: KeyboardEvent, axis: Axis) {
    const current = axis === 'x' ? left : top
    const page = axis === 'x' ? width : height
    let next: number
    switch (event.key) {
      case 'ArrowLeft': if (axis !== 'x') return; next = current - 40; break
      case 'ArrowRight': if (axis !== 'x') return; next = current + 40; break
      case 'ArrowUp': if (axis !== 'y') return; next = current - 40; break
      case 'ArrowDown': if (axis !== 'y') return; next = current + 40; break
      case 'PageUp': next = current - page; break
      case 'PageDown': next = current + page; break
      case 'Home': next = 0; break
      case 'End': next = axis === 'x' ? maxX : maxY; break
      default: return
    }
    event.preventDefault()
    setPosition(axis, next)
  }

  onMount(() => {
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(content)
    observer.observe(horizontal)
    observer.observe(vertical)
    for (const child of content.children) observer.observe(child)
    let frame = 0
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    })
    mutations.observe(content, { childList: true, subtree: true, attributes: true, characterData: true })
    measure()
    return () => { observer.disconnect(); mutations.disconnect(); cancelAnimationFrame(frame) }
  })
</script>

<div class={`scroll-area ${className}`} class:dragging={dragging !== null}>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable regions need keyboard focus for native scrolling.) -->
  <div bind:this={viewport} id={viewportId} class="viewport" role="region" aria-label={ariaLabel} tabindex="0" onscroll={syncScroll}>
    <div bind:this={content} class="content">{@render children()}</div>
  </div>
  <div
    bind:this={horizontal}
    class="track horizontal"
    class:inactive={maxX <= 0}
    class:active={dragging === 'x'}
    role="scrollbar"
    aria-label={`${ariaLabel}：水平滚动`}
    aria-controls={viewportId}
    aria-orientation="horizontal"
    aria-valuemin={0}
    aria-valuemax={maxX}
    aria-valuenow={left}
    aria-hidden={maxX <= 0}
    tabindex={maxX > 0 ? 0 : -1}
    onkeydown={(event) => keyDown(event, 'x')}
    onpointerdown={(event) => pointerDown(event, 'x')}
    onpointermove={pointerMove}
    onpointerup={pointerEnd}
    onpointercancel={pointerEnd}
    onlostpointercapture={pointerEnd}
  >
    <div class="thumb" style:width={`${thumbWidth}px`} style:transform={`translateX(${thumbLeft}px)`}></div>
  </div>
  <div
    bind:this={vertical}
    class="track vertical"
    class:inactive={maxY <= 0}
    class:active={dragging === 'y'}
    role="scrollbar"
    aria-label={`${ariaLabel}：垂直滚动`}
    aria-controls={viewportId}
    aria-orientation="vertical"
    aria-valuemin={0}
    aria-valuemax={maxY}
    aria-valuenow={top}
    aria-hidden={maxY <= 0}
    tabindex={maxY > 0 ? 0 : -1}
    onkeydown={(event) => keyDown(event, 'y')}
    onpointerdown={(event) => pointerDown(event, 'y')}
    onpointermove={pointerMove}
    onpointerup={pointerEnd}
    onpointercancel={pointerEnd}
    onlostpointercapture={pointerEnd}
  >
    <div class="thumb" style:height={`${thumbHeight}px`} style:transform={`translateY(${thumbTop}px)`}></div>
  </div>
</div>

<style>
  .scroll-area {
    flex: 1;
    min-height: 0;
    min-width: 0;
    position: relative;
    overflow: hidden;
  }

  .viewport {
    height: 100%;
    width: 100%;
    overflow: auto;
    scrollbar-width: none;
    box-sizing: border-box;
  }

  .viewport::-webkit-scrollbar { display: none; }
  .viewport:focus-visible { outline: 2px solid #7cadd2; outline-offset: -2px; }
  .content { display: flow-root; min-width: 100%; width: 100%; min-height: 100%; height: 100%; box-sizing: border-box; }

  .track {
    position: absolute;
    z-index: 1;
    border-radius: 999px;
    background: #e5eff8;
    box-shadow: inset 2px 2px 4px #b9cedd88, inset -2px -2px 4px #ffffff;
    touch-action: none;
    user-select: none;
    transition: background-color 160ms ease, opacity 160ms ease;
  }

  .horizontal { left: 4px; right: 16px; bottom: 3px; height: 10px; }
  .vertical { top: 4px; bottom: 16px; right: 3px; width: 10px; }
  .inactive { visibility: hidden; pointer-events: none; opacity: 0; }
  .thumb {
    position: absolute;
    border-radius: 999px;
    background: #a9cbe4;
    box-shadow: 1px 1px 3px #8cacc177, inset 1px 1px 2px #eaf6ff;
    transition: background-color 160ms ease;
  }
  .horizontal .thumb { top: 2px; left: 0; height: 6px; }
  .vertical .thumb { top: 0; left: 2px; width: 6px; }
  .track:hover .thumb, .track:focus-visible .thumb, .track.active .thumb { background: #6fadd8; }
  .track:focus-visible { outline: 2px solid #649bc2; outline-offset: 1px; }
  .dragging, .dragging .track { cursor: grabbing; }

  @media (prefers-reduced-motion: reduce) {
    .track, .thumb { transition: none; }
    .viewport { scroll-behavior: auto; }
  }
</style>
