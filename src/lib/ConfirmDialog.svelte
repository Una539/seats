<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { TriangleAlert, X } from '@lucide/svelte'
  let { title, description, confirmLabel = '确认', onresolve }: { title: string; description: string; confirmLabel?: string; onresolve: (value: boolean) => void } = $props()
  let panel: HTMLDivElement
  let cancelButton: HTMLButtonElement
  let duration = $state(180)
  onMount(() => {
    const previous = document.activeElement as HTMLElement | null
    duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180
    const root = document.querySelector('main')
    const wasInert = root?.inert ?? false
    if (root) root.inert = true
    cancelButton.focus()
    return () => { if (root) root.inert = wasInert; previous?.focus() }
  })
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); onresolve(false) }
    if (event.key !== 'Tab') return
    const buttons = [...panel.querySelectorAll<HTMLButtonElement>('button')]
    const first = buttons[0], last = buttons.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
</script>

<svelte:window onkeydown={keydown} />
<div class="dialog-backdrop" transition:fade={{ duration }}>
  <div class="confirm-dialog" bind:this={panel} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" tabindex="-1" transition:scale={{ duration, start: .95 }}>
    <button class="dialog-close" aria-label="取消并关闭" onclick={() => onresolve(false)}><X size={18} /></button>
    <div class="dialog-icon"><TriangleAlert size={25} strokeWidth={1.7} /></div>
    <h2 id="confirm-title">{title}</h2>
    <p id="confirm-description">{description}</p>
    <div class="dialog-actions"><button bind:this={cancelButton} onclick={() => onresolve(false)}>取消</button><button class="dialog-confirm" onclick={() => onresolve(true)}>{confirmLabel}</button></div>
  </div>
</div>

<style>
  .dialog-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:24px;background:#29395152;backdrop-filter:blur(7px)}
  .confirm-dialog{position:relative;width:min(420px,100%);padding:32px;background:var(--surface);border:1px solid #f5f8ff;border-radius:24px;box-shadow:16px 20px 60px #21345833,-4px -4px 24px #ffffff40;outline:none}
  .dialog-close{position:absolute;right:16px;top:16px;width:32px;height:32px;display:grid;place-items:center;border-radius:10px;box-shadow:none;background:transparent}
  .dialog-icon{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:#dbe4f6;color:#5265ab;box-shadow:var(--inset);margin-bottom:20px}
  h2{font-size:20px;font-weight:650;letter-spacing:.3px}p{font-size:13px;line-height:1.9;color:var(--muted);margin:12px 0 28px}
  .dialog-actions{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dialog-actions button{padding:12px;font-weight:600;font-size:13px}.dialog-actions .dialog-confirm{background:#526dce;color:white;border-color:#7890df}.dialog-confirm:hover{background:#435fbe}
</style>
