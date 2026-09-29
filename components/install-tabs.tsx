"use client"

import { SquareTerminalIcon } from "lucide-react"
import { useSyncExternalStore } from "react"

import { CopyButton } from "@/components/copy-button"
import {
  installCommands,
  packageManagers,
  type PackageManager,
} from "@/lib/site"
import { cn } from "@/lib/utils"

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
    <div className="overflow-hidden rounded-lg border bg-muted/50">
      <div className="flex items-center gap-1 border-b px-2 py-1.5">
        <SquareTerminalIcon className="mr-1 size-4 text-muted-foreground" />
        <div role="tablist" aria-label="Package manager" className="flex gap-1">
          {packageManagers.map((pm) => (
            <button
              key={pm}
              type="button"
              role="tab"
              aria-selected={pm === manager}
              onClick={() => saveManager(pm)}
              className={cn(
                "rounded-md border border-transparent px-2 py-0.5 font-mono text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                pm === manager && "border-border bg-background text-foreground",
              )}
            >
              {pm}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <CopyButton value={command} />
        </div>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm text-muted-foreground">
        <code>{command}</code>
      </pre>
    </div>
  )
}
