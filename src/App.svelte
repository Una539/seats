<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly, scale, slide } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import ConfirmDialog from './lib/ConfirmDialog.svelte'
  import NumberStepper from './lib/NumberStepper.svelte'
  import ScrollArea from './lib/ScrollArea.svelte'
  import { Armchair, PanelsTopLeft, Upload, Download, Shuffle, Undo2, Users, CircleCheck, DoorOpen, AppWindow, LayoutGrid, RotateCcw } from '@lucide/svelte'
  import '@fontsource-variable/noto-sans-sc'
  import { initialState, loadState, saveState, parseStudents, pendingStudents, resize, assign, type ClassroomState, type Seat } from './lib/model'

  import { parsePreferenceRules, randomAssignWithPreferences, type PreferenceRule } from './lib/preferences'

  let preferenceRules = $state<PreferenceRule[]>([])
  let randomizing = $state(false)
  let ruleFileInput: HTMLInputElement
  let classroomState = $state<ClassroomState>(initialState())
  let editing = $state(false)
  let selected = $state<string | null>(null)
  let message = $state('')
  let motionDuration = $state(180)
  function collapseLayout(node: HTMLElement, options: { duration: number }) {
    const transition = slide(node, options)
    const gap = node.parentElement ? parseFloat(getComputedStyle(node.parentElement).rowGap) || 0 : 0
    return {
      ...transition,
      css: (t: number, u: number) => `${transition.css?.(t, u) ?? ''}; margin-bottom: ${-gap * (1 - t)}px;`
    }
  }
  let confirmation = $state<{ title: string; description: string; confirmLabel: string; resolve: (answer: boolean) => void } | null>(null)
  function ask(title: string, description: string, confirmLabel: string): Promise<boolean> {
    return new Promise(resolve => { confirmation = { title, description, confirmLabel, resolve } })
  }
  function resolveConfirmation(answer: boolean) {
    confirmation?.resolve(answer)
    confirmation = null
  }
  let storageMessage = $state('')
  let ready = $state(false)
  let canSave = $state(true)
  let exporting = $state(false)
  let undo = $state<ClassroomState | null>(null)
  let rows = $state(7), cols = $state(8)
  let fileInput: HTMLInputElement
  const pending = $derived(pendingStudents(classroomState))
  const assignedCount = $derived(classroomState.students.length - pending.length)
  const enabledCount = $derived(classroomState.seats.filter(s => s.enabled).length)
  const names = $derived(new Map(classroomState.students.map(s => [s.id, s.name])))
  const selectedName = $derived(selected ? names.get(selected) : null)
  const tracks = $derived(Array.from({ length: classroomState.cols }, (_, c) => `minmax(64px, 1fr)${classroomState.verticalAisles.includes(c + 1) ? ' clamp(48px, 4.5vw, 76px)' : ''}`).join(' '))
  function gridCol(col: number) { return col + 1 + classroomState.verticalAisles.filter(b => b <= col).length }

  onMount(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => { motionDuration = media.matches ? 0 : 180 }
    syncMotion()
    media.addEventListener('change', syncMotion)
    try { const saved = loadState(); if (saved) { classroomState = saved; rows = saved.rows; cols = saved.cols; message = '' } }
    catch { canSave = false; storageMessage = '无法恢复本地记录；原记录未覆盖。新操作后将重新保存。' }
    ready = true
    return () => { media.removeEventListener('change', syncMotion); confirmation?.resolve(false) }
  })
  $effect(() => {
    if (!message) return
    const timeout = setTimeout(() => { message = '' }, 3800)
    return () => clearTimeout(timeout)
  })
  $effect(() => {
    const snapshot = JSON.stringify(classroomState)
    if (ready && canSave) {
      try { saveState(JSON.parse(snapshot)); storageMessage = '' }
      catch { storageMessage = '本地保存失败，请勿关闭页面；可先导出 Excel。' }
    }
  })
  function commit(next: ClassroomState) { canSave = true; classroomState = next; undo = null }
  async function clearSeats() {
    if (!assignedCount) return
    if (!await ask('清空所有座位安排？', `将取消 ${assignedCount} 名学生的座位安排。学生名单、禁用座位及过道布局会保留，此操作无法撤销。`, '清空安排')) return
    commit({ ...classroomState, seats: classroomState.seats.map(seat => ({ ...seat, studentId: null })) })
    selected = null
    message = '已清空座位安排。'
  }
  async function importFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    try {
      if (!file.name.toLowerCase().endsWith('.txt')) throw new Error('请选择 UTF-8 编码的 TXT 文件。')
      const students = parseStudents(await file.text())
      if (!students.length) throw new Error('文件中没有有效姓名，请检查后重新导入。')
      if (classroomState.students.length && !await ask('替换学生名单？', '替换后将清空现有座位安排，保留当前布局。此操作无法撤销。', '替换名单')) return
      commit({ ...classroomState, students, seats: classroomState.seats.map(s => ({ ...s, studentId: null })) })
      preferenceRules = []
      selected = null; message = `已导入 ${students.length} 名学生，请选择学生和空座位。`
    } catch (error) { message = (error as Error).message }
    finally { input.value = '' }
  }
  async function clickSeat(seat: Seat) {
    if (editing) {
      if (seat.studentId) { message = '该座位已有学生，请先在排座位模式取消安排。'; return }
      commit({ ...classroomState, seats: classroomState.seats.map(s => s === seat ? { ...s, enabled: !s.enabled } : s) }); return
    }
    if (!seat.enabled) return
    if (seat.studentId) {
      if (await ask('取消座位安排？', `${names.get(seat.studentId)} 将返回待安排名单，可以重新选择座位。`, '取消安排')) {
        commit({ ...classroomState, seats: classroomState.seats.map(s => s === seat ? { ...s, studentId: null } : s) }); message = '已取消安排，学生已返回待安排名单。'
      }
    } else if (selected) {
      try { commit(assign(classroomState, seat.row, seat.col, selected)); message = `已为 ${selectedName} 安排座位。`; selected = null }
      catch (error) { message = (error as Error).message }
    } else message = '请先在左侧选择一名学生，再点击空座位。'
  }
  function applySize() {
    try { commit(resize(classroomState, Number(rows), Number(cols))); message = `布局已更新为 ${classroomState.rows} 行 × ${classroomState.cols} 列。` }
    catch (error) { message = (error as Error).message; rows = classroomState.rows; cols = classroomState.cols }
  }
  function toggleAisle(boundary: number) {
    commit({ ...classroomState, seats: [...classroomState.seats], verticalAisles: classroomState.verticalAisles.includes(boundary) ? classroomState.verticalAisles.filter(b => b !== boundary) : [...classroomState.verticalAisles, boundary].sort((a,b) => a-b) })
  }
  async function importRules(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    message = ''
    try {
      const value: unknown = JSON.parse((await file.text()).replace(/^\uFEFF/, ''))
      preferenceRules = parsePreferenceRules(value, classroomState.students)
      message = '导入成功'
    } catch {
      // A failed read or invalid JSON must not replace the current rules.
    } finally {
      input.value = ''
    }
  }
  async function randomize() {
    if (randomizing) return
    if (!pending.length) { message = '所有学生均已安排。'; return }
    randomizing = true
    const before = classroomState
    try {
      const next = await randomAssignWithPreferences(before, preferenceRules)
      // Layout or roster edits during an optimization must not be overwritten.
      if (classroomState !== before) return
      canSave = true
      undo = before
      classroomState = next
      selected = null
      message = ''
    } catch (error) {
      message = (error as Error).message
    } finally {
      randomizing = false
    }
  }
  async function exportFile() {
    exporting = true
    try { const { downloadExcel } = await import('./lib/export'); await downloadExcel(classroomState); message = '已导出讲台视角的 Excel 座位表。' }
    catch { message = 'Excel 导出失败，请重试。' }
    finally { exporting = false }
  }
</script>

<svelte:head><title>班级座位管理器 · Classroom</title><meta name="description" content="本地班级排座工具：手动选座、随机安排、布局编辑与 Excel 座位表导出。" /></svelte:head>

<main class="app-shell">
  <aside class="workspace">
    <header class="brand"><div class="brand-mark" aria-hidden="true"><LayoutGrid size={25} strokeWidth={1.8} /></div><div><h1>班级座位管理器</h1><span>CLASSROOM SEATING</span></div></header>
    <div class="mode-switch" class:editing aria-label="操作模式"><span class="mode-indicator" aria-hidden="true"></span>
      <button class:active={!editing} onclick={() => { editing = false; message = '' }} aria-pressed={!editing}><Armchair size={17} />排座位</button>
      <button class:active={editing} onclick={() => { editing = true; selected = null; message = '' }} aria-pressed={editing}><PanelsTopLeft size={17} />编辑布局</button>
    </div>
    <div class="file-actions"><button onclick={() => fileInput.click()}><Upload size={17} />导入 TXT</button><button onclick={exportFile} disabled={exporting}><Download size={17} />{exporting ? '导出中…' : '导出 Excel'}</button></div>
    <input class="hidden" bind:this={fileInput} type="file" accept=".txt,text/plain" onchange={importFile} />
    <div class="random-actions">
      <button class="random-button" onclick={randomize} disabled={editing || randomizing || !pending.length}><Shuffle size={18} />随机安排剩余学生</button>
      <button class="rule-import-button" aria-label="导入 JSON 偏好规则" onclick={() => ruleFileInput.click()}><Upload size={18} /></button>
    </div>
    <input class="hidden" bind:this={ruleFileInput} type="file" accept=".json,application/json" onchange={importRules} />
    {#if undo}<button class="undo-button" onclick={() => { if (undo) { classroomState = undo; undo = null; message = '已撤销上次随机安排。' } }}><Undo2 size={15} />撤销本次随机安排</button>{/if}
    {#if editing}
      <section class="layout-settings" aria-label="布局参数" transition:collapseLayout={{ duration: motionDuration }}>
        <div class="section-heading"><h2>布局设置</h2><span>最多 20 × 20</span></div>
        <div class="dimensions"><NumberStepper label="行数" bind:value={rows} /><NumberStepper label="列数" bind:value={cols} /><button onclick={applySize}>应用</button></div>
        <p class="small-label">纵向过道 <span>点击列间切换</span></p>
        <div class="aisle-options" style:grid-template-columns={`repeat(${Math.max(1, Math.min(classroomState.cols - 1, 4))}, minmax(0, 1fr))`}> {#each Array.from({ length: classroomState.cols - 1 }, (_, i) => i + 1) as boundary}<button class:active={classroomState.verticalAisles.includes(boundary)} aria-pressed={classroomState.verticalAisles.includes(boundary)} onclick={() => toggleAisle(boundary)}>{boundary} | {boundary + 1}</button>{/each}</div>
      </section>
    {/if}
    <section class="roster">
      <div class="section-heading"><h2>待安排名单</h2></div>
      <p class="roster-hint">{editing ? '完成布局后，切换至排座位' : '选择一位学生，然后点击空座位'}</p>
      <ScrollArea ariaLabel="待安排名单"><div class="student-list">
        {#each pending as student, i (student.id)}
          <button animate:flip={{ duration: motionDuration }} out:fly={{ x: 12, duration: motionDuration }} class="student" class:selected={selected === student.id} disabled={editing} aria-pressed={selected === student.id} onclick={() => { selected = selected === student.id ? null : student.id }}><span class="student-number">{String(i + 1).padStart(2, '0')}</span><span>{student.name}</span><span class="selection-dot" aria-hidden="true"></span></button>
        {:else}
          <div class="empty-list"><span aria-hidden="true">{#if classroomState.students.length}<CircleCheck size={32} />{:else}<Users size={32} />{/if}</span><strong>{classroomState.students.length ? '每个人都有座位了' : '从一份名单开始'}</strong><p>{classroomState.students.length ? '点击座位中的姓名可取消安排' : '导入 UTF-8 TXT，每行一个姓名'}</p></div>
        {/each}
      </div></ScrollArea>
    </section>
    <footer class="workspace-footer">
          <button class="reset-progress" onclick={clearSeats} disabled={!assignedCount} aria-label={`已安排 ${assignedCount} 人，共 ${classroomState.students.length} 人。点击清空所有座位安排`}>
            <span class="summary"><span>已安排 <strong>{assignedCount}</strong> / {classroomState.students.length} 人</span><span class="reset-label"><RotateCcw size={13} />清空</span></span>
            <span class="progress"><span style:width={`${classroomState.students.length ? assignedCount / classroomState.students.length * 100 : 0}%`}></span></span>
            <span class="seat-total">有效座位 {enabledCount}</span>
          </button>
          {#if storageMessage}<p class="save-note storage-error" role="alert">{storageMessage}</p>{/if}
        </footer>
  </aside>
  <section class="classroom" aria-label="学生视角教室座位图">
    <div class="front"><span class="front-line"></span><div class="blackboard"><span>黑板</span></div><span class="front-line"></span></div>
    <div class="room-body"><div class="side-label window-label"><AppWindow size={15} /><span>窗户</span></div>
      <ScrollArea ariaLabel="教室座位图"><div class="matrix-scroll"><div class="seat-matrix" style:grid-template-columns={tracks} style:grid-template-rows={`repeat(${classroomState.rows}, minmax(62px, 1fr))`}>
        {#each classroomState.verticalAisles as boundary (boundary)}<div class="aisle" in:fade={{ duration: motionDuration }} style:grid-column={gridCol(boundary - 1) + 1} style:grid-row={`1 / span ${classroomState.rows}`}><span>过道</span></div>{/each}
        {#each classroomState.seats as seat (`${seat.row}-${seat.col}`)}
          <button animate:flip={{ duration: motionDuration ? 240 : 0 }} class="seat" class:occupied={!!seat.studentId} class:disabled-seat={!seat.enabled} class:available={!!selected && seat.enabled && !seat.studentId && !editing} class:layout-mode={editing} disabled={!editing && !seat.enabled} style:grid-row={seat.row + 1} style:grid-column={gridCol(seat.col)} onclick={() => clickSeat(seat)} aria-label={`第 ${seat.row + 1} 排第 ${seat.col + 1} 列，${!seat.enabled ? '禁用' : seat.studentId ? names.get(seat.studentId) + '，点击取消安排' : '空座位'}`}>
            <span class="seat-coordinate">{seat.row + 1}–{seat.col + 1}</span>{#if seat.studentId}{#key seat.studentId}<span class="seat-name" in:scale={{ start: .86, duration: motionDuration, delay: motionDuration ? (seat.row + seat.col) * 7 : 0 }}>{names.get(seat.studentId)}</span>{/key}{/if}<span class="seat-base" aria-hidden="true"></span>
          </button>
        {/each}
      </div></div></ScrollArea>
      <div class="side-label door-label"><DoorOpen size={15} /><span>教室门</span></div>
    </div>

  </section>
</main>

{#if message}<div class="toast" role="status" transition:fly={{ y: 10, duration: motionDuration }}>{message}</div>{/if}
{#if confirmation}<ConfirmDialog title={confirmation.title} description={confirmation.description} confirmLabel={confirmation.confirmLabel} onresolve={resolveConfirmation} />{/if}
