import ExcelJS from 'exceljs'
import type { ClassroomState } from './model'

export async function createWorkbook(
  state: ClassroomState,
): Promise<ExcelJS.Workbook> {
  const { rows, cols } = state
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) {
    throw new RangeError('教室行数和列数必须为正整数')
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Classroom'
  const sheet = workbook.addWorksheet('座位表', {
    views: [{ showGridLines: false }],
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      verticalCentered: true,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.3,
        bottom: 0.3,
        header: 0,
        footer: 0,
      },
    },
  })

  const aisles = new Set(
    state.verticalAisles
      .filter((boundary) => Number.isInteger(boundary) && boundary > 0 && boundary < cols)
      .map((boundary) => cols - boundary),
  )
  const seatColumns: number[] = []
  const aisleColumns: number[] = []
  // Outer columns keep the door and window labels outside the seating grid.
  let column = 2
  for (let displayCol = 0; displayCol < cols; displayCol += 1) {
    seatColumns.push(column)
    sheet.getColumn(column).width = 16
    column += 1
    if (aisles.has(displayCol + 1)) {
      aisleColumns.push(column)
      sheet.getColumn(column).width = 5
      column += 1
    }
  }
  const lastColumn = column
  const firstSeatRow = 3
  const lastSeatRow = firstSeatRow + rows - 1
  const podiumRow = lastSeatRow + 2
  sheet.getColumn(1).width = 6
  sheet.getColumn(lastColumn).width = 6

  sheet.mergeCells(1, 1, 1, lastColumn)
  const title = sheet.getCell(1, 1)
  title.value = '班级座位表（讲台视角）'
  title.font = { name: '微软雅黑', size: 18, bold: true }
  title.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 36
  sheet.getRow(2).height = 24
  for (const [labelColumn, label] of [[1, '门'], [lastColumn, '窗']] as const) {
    const cell = sheet.getCell(2, labelColumn)
    cell.value = label
    cell.font = { name: '微软雅黑', size: 11, bold: true }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  const names = new Map(state.students.map((student) => [student.id, student.name]))
  const seats = new Map(state.seats.map((seat) => [`${seat.row}:${seat.col}`, seat]))
  for (let displayRow = 0; displayRow < rows; displayRow += 1) {
    const excelRow = firstSeatRow + displayRow
    sheet.getRow(excelRow).height = 42
    for (let displayCol = 0; displayCol < cols; displayCol += 1) {
      const seat = seats.get(`${rows - 1 - displayRow}:${cols - 1 - displayCol}`)
      const cell = sheet.getCell(excelRow, seatColumns[displayCol]!)
      const enabled = seat?.enabled ?? false
      cell.value = enabled && seat?.studentId != null
        ? names.get(seat.studentId) ?? ''
        : ''
      cell.font = { name: '微软雅黑', size: 12 }
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
        textRotation: 0,
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: enabled ? 'FFFFFFFF' : 'FFD9D9D9' },
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF808080' } },
        bottom: { style: 'thin', color: { argb: 'FF808080' } },
        left: { style: 'thin', color: { argb: 'FF808080' } },
        right: { style: 'thin', color: { argb: 'FF808080' } },
      }
    }
  }

  for (const aisleColumn of aisleColumns) {
    sheet.mergeCells(firstSeatRow, aisleColumn, lastSeatRow, aisleColumn)
    const cell = sheet.getCell(firstSeatRow, aisleColumn)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    cell.value = '过\n道'
    cell.font = { name: '微软雅黑', size: 10, color: { argb: 'FF808080' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  }

  sheet.getRow(lastSeatRow + 1).height = 12
  sheet.mergeCells(podiumRow, 2, podiumRow, lastColumn - 1)
  const podium = sheet.getCell(podiumRow, 2)
  podium.value = '讲台'
  podium.font = { name: '微软雅黑', size: 14, bold: true }
  podium.alignment = { horizontal: 'center', vertical: 'middle' }
  podium.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }
  sheet.getRow(podiumRow).height = 32
  sheet.pageSetup.printArea = `A1:${sheet.getCell(podiumRow, lastColumn).address}`
  return workbook
}

export async function downloadExcel(state: ClassroomState): Promise<void> {
  const workbook = await createWorkbook(state)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '班级座位表.xlsx'
  link.style.display = 'none'
  try {
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    // Allow the browser to start consuming the download before releasing its URL.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
