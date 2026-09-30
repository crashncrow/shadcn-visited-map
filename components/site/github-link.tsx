import { GitHubIcon } from "@/components/github-icon"
import { Button } from "@/components/ui/button"
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
    <Button
      size="sm"
      variant="ghost"
      className="h-8 shadow-none"
      render={
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            stars === null
              ? "GitHub repository"
              : `GitHub repository, ${stars} stars`
          }
        />
      }
      nativeButton={false}
    >
      <GitHubIcon />
      {stars !== null && (
        <span className="w-fit text-xs text-muted-foreground tabular-nums">
          {formatStars(stars)}
        </span>
      )}
    </Button>
  )
}
