export type PropRow = {
  name: string
  type: string
  default?: string
  description: string
}

export function PropsTable({
  rows,
  showDefault,
}: {
  rows: PropRow[]
  showDefault?: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            {showDefault && <th className="px-4 py-2 font-medium">Default</th>}
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t align-top">
              <td className="px-4 py-2 font-mono text-xs">{row.name}</td>
              <td className="px-4 py-2 font-mono text-xs">{row.type}</td>
              {showDefault && (
                <td className="px-4 py-2 font-mono text-xs">
                  {row.default ?? "—"}
                </td>
              )}
              <td className="px-4 py-2">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
