import { GitHubIcon } from "@/components/github-icon"
import { repoUrl } from "@/lib/docs-nav"
import { cn } from "@/lib/utils"

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "flex flex-col items-center gap-1.5 px-4 pt-4 pb-12 text-center text-sm",
        className,
      )}
    >
      <p>
        Made with ♥ by{" "}
        <a
          href="https://x.com/_nnaro_"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium"
        >
          @_nnaro_
        </a>
      </p>
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[0.82rem] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
      >
        <GitHubIcon className="size-4" />
        View source on GitHub
      </a>
    </footer>
  )
}
