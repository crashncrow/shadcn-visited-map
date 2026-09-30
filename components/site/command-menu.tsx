"use client"

import { FileTextIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { docsNav } from "@/lib/docs-nav"

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-8 w-8 justify-center bg-muted/50 px-0 text-muted-foreground sm:w-56 sm:justify-start sm:px-2.5 dark:bg-input/30"
        aria-label="Search documentation"
      >
        <SearchIcon className="sm:hidden" />
        <span className="hidden flex-1 text-left font-normal sm:inline">
          Search documentation…
        </span>
        <kbd className="pointer-events-none hidden h-5 items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[0.7rem] font-medium sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Find a page in the docs"
      >
        <Command>
          <CommandInput placeholder="Search documentation…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {docsNav.map((group) => (
              <CommandGroup key={group.title} heading={group.title}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${group.title} ${item.title}`}
                    onSelect={() => go(item.href)}
                  >
                    <FileTextIcon />
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
