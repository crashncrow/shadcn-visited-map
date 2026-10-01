"use client"

import { SquareTerminalIcon } from "lucide-react"
import { useSyncExternalStore } from "react"

import { CopyButton } from "@/components/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  installCommands,
  packageManagers,
  type PackageManager,
} from "@/lib/site"

const STORAGE_KEY = "package-manager"
const DEFAULT_MANAGER: PackageManager = "npm"
const CHANGE_EVENT = "package-manager-change"

function isPackageManager(value: unknown): value is PackageManager {
  return packageManagers.includes(value as PackageManager)
}

// In-memory copy so the tabs still work when localStorage is unavailable.
let memory: PackageManager | null = null

function readManager(): PackageManager {
  if (memory) return memory
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return isPackageManager(saved) ? saved : DEFAULT_MANAGER
  } catch {
    return DEFAULT_MANAGER
  }
}

function subscribe(onChange: () => void) {
  const onStorage = () => {
    memory = null
    onChange()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function saveManager(next: PackageManager) {
  memory = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function InstallTabs() {
  // The server snapshot is the default, so server and client HTML match.
  const manager = useSyncExternalStore(
    subscribe,
    readManager,
    () => DEFAULT_MANAGER,
  )

  const command = installCommands[manager]

  return (
    <Tabs
      value={manager}
      onValueChange={(value) => saveManager(value as PackageManager)}
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
