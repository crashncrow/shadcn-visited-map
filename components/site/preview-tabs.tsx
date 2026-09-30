"use client"

import { CopyButton } from "@/components/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Preview | Code tabs like the Map Builder's. `preview` and `code` can be
 * server-rendered; only the tab switching runs in the browser.
 */
export function PreviewTabs({
  preview,
  code,
  copyValue,
}: {
  preview: React.ReactNode
  code: React.ReactNode
  copyValue: string
}) {
  return (
    <Tabs defaultValue="preview" className="gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <CopyButton value={copyValue} label="Copy code" />
      </div>
      <TabsContent value="preview">{preview}</TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  )
}
