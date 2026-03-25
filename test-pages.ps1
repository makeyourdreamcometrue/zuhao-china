$pages = @(
    "/",
    "/properties",
    "/properties/new",
    "/login",
    "/about",
    "/terms",
    "/privacy",
    "/dashboard",
    "/profile",
    "/applications",
    "/my-applications",
    "/leases",
    "/payments",
    "/expenses",
    "/inspections",
    "/maintenance"
)

$results = @()
foreach ($page in $pages) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000$page" -TimeoutSec 10 -UseBasicParsing
        $results += [PSCustomObject]@{
            Page = $page
            Status = $r.StatusCode
            OK = "YES"
        }
    } catch {
        $results += [PSCustomObject]@{
            Page = $page
            Status = $_.Exception.Response.StatusCode.value__
            OK = "NO"
        }
    }
}

$results | Format-Table -AutoSize
