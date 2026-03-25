export function toCsv(columns: string[], rows: Record<string, unknown>[]): string {
  const header = columns.join(',')
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      })
      .join(','),
  )
  return [header, ...lines].join('\n')
}
