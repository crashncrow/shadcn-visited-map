"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyButton({
  value,
  label,
  "aria-label": ariaLabel = "Copy to clipboard",
}: {
  value: string
  /** Visible text; without it the button is icon-only. */
  label?: string
  "aria-label"?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const icon = copied ? <CheckIcon /> : <CopyIcon />

  if (label) {
    return (
      <Button variant="outline" onClick={copy}>
        {icon}
        {copied ? "Copied" : label}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Copied" : ariaLabel}
      onClick={copy}
    >
      {icon}
    </Button>
  )
}
