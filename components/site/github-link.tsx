import { GitHubIcon } from "@/components/github-icon"
import { repoUrl } from "@/lib/docs-nav"

async function getStars() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/crashncrow/shadcn-visited-map",
      // Refresh at most once an hour instead of on every visit.
      { next: { revalidate: 3600 } },
    )
    if (!response.ok) return null
    const data: { stargazers_count?: number } = await response.json()
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null
  } catch {
    return null
  }
}

function formatStars(stars: number) {
  return stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : String(stars)
}

export async function GitHubLink() {
  const stars = await getStars()

  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        stars === null
          ? "GitHub repository"
          : `GitHub repository, ${stars} stars`
      }
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <GitHubIcon className="size-4" />
      {stars !== null && (
        <span className="text-xs tabular-nums">{formatStars(stars)}</span>
      )}
    </a>
  )
}
