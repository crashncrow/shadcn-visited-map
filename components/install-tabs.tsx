"use client"

import { SquareTerminalIcon } from "lucide-react"
import { useState } from "react"

import { CopyButton } from "@/components/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  installCommands,
  packageManagers,
  type PackageManager,
} from "@/lib/site"

export function InstallTabs() {
  const [manager, setManager] = useState<PackageManager>("npm")

  const command = installCommands[manager]

  return (
    <Tabs
      value={manager}
      onValueChange={(value) => setManager(value as PackageManager)}
      className="gap-0 overflow-hidden rounded-lg border bg-muted/50"
    >
      <div className="flex items-center gap-1 border-b px-2 py-1.5">
        <SquareTerminalIcon className="mr-1 size-4 text-muted-foreground" />
        <TabsList aria-label="Package manager" className="gap-1 bg-transparent">
          {packageManagers.map((pm) => (
            <TabsTrigger
              key={pm}
              value={pm}
              className="px-2 font-mono font-normal data-active:border-border"
            >
              {pm}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="ml-auto">
          <CopyButton value={command} />
        </div>
      </div>
      {/* One panel for whichever manager is active. */}
      <TabsContent value={manager}>
        <pre className="overflow-x-auto p-4 font-mono text-sm text-muted-foreground">
          <code>{command}</code>
        </pre>
      </TabsContent>
    </Tabs>
  )
}
