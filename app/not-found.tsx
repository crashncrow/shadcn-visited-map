import { MapPinOffIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl border bg-card text-muted-foreground">
        <MapPinOffIcon className="size-7" />
      </div>
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        This place isn&apos;t on the map
      </h1>
      <p className="text-balance text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Head
        back home or pick up where the docs left off.
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button render={<Link href="/" />} nativeButton={false}>
          Go home
        </Button>
        <Button
          variant="ghost"
          render={<Link href="/docs" />}
          nativeButton={false}
        >
          Read the docs
        </Button>
      </div>
    </main>
  )
}
