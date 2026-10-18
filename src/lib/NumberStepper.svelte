<script lang="ts">
  import { Minus, Plus } from '@lucide/svelte'
  let { value = $bindable(1), label, min = 1, max = 20 }: { value?: number; label: string; min?: number; max?: number } = $props()
  function adjust(delta: number) { value = Math.max(min, Math.min(max, (Number(value) || min) + delta)) }
  function normalize() { value = Math.max(min, Math.min(max, Math.round(Number(value) || min))) }
</script>
<div class="number-field"><span>{label}</span><span class="stepper">
  <button type="button" aria-label={`减少${label}`} disabled={value <= min} onclick={() => adjust(-1)}><Minus size={13} /></button>
  <input type="text" inputmode="numeric" role="spinbutton" aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={Number(value) || min} value={value} oninput={(event) => { value = Number(event.currentTarget.value) }} onblur={normalize} onkeydown={(event) => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); adjust(event.key === 'ArrowUp' ? 1 : -1) } if (event.key === 'Enter') normalize() }} />
  <button type="button" aria-label={`增加${label}`} disabled={value >= max} onclick={() => adjust(1)}><Plus size={13} /></button>
</span></div>
<style>
  .number-field{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1;font-size:11px;color:var(--muted)}
  .stepper{display:grid;grid-template-columns:25px minmax(20px,1fr) 25px;align-items:center;padding:4px;gap:1px;border-radius:11px;box-shadow:var(--inset);background:#dee7f6;border:1px solid #ccd7e9}
  button{height:28px;width:25px;display:grid;place-items:center;padding:0;border-radius:7px;box-shadow:2px 2px 4px #becbe0,-2px -2px 4px #f7faff;color:#3e557c}button:disabled{opacity:.35;box-shadow:none;background:transparent}
  button:hover:not(:disabled){transform:none}
  button:hover:not(:disabled) :global(svg){transform:none}
  input{width:100%;min-width:0;border:0;background:transparent;text-align:center;padding:0;color:#293951;font:600 14px/28px 'Noto Sans SC Variable',sans-serif;outline:none;border-radius:4px}
</style>
