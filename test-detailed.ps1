$pages = @(
    "/properties/new",
    "/properties/123",
    "/properties/abc"
)

$results = @()
foreach ($page in $pages) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000$page" -TimeoutSec 10 -UseBasicParsing
        $content = $r.Content.Substring(0, [Math]::Min(200, $r.Content.Length))
        $results += [PSCustomObject]@{
            Page = $page
            Status = $r.StatusCode
            ContentPreview = $content
        }
    } catch {
        $results += [PSCustomObject]@{
            Page = $page
            Status = "ERROR"
            ContentPreview = $_.Exception.Message
        }
    }
}

$results | Format-List
