$pages = @(
    @{url="/";name="Home";desc="Home page"},
    @{url="/properties";name="Properties";desc="Property listings"},
    @{url="/login";name="Login";desc="Login page"},
    @{url="/about";name="About";desc="About page"},
    @{url="/terms";name="Terms";desc="Terms of service"},
    @{url="/privacy";name="Privacy";desc="Privacy policy"},
    @{url="/dashboard";name="Dashboard";desc="User dashboard"},
    @{url="/profile";name="Profile";desc="User profile"},
    @{url="/applications";name="Applications";desc="Applications list"},
    @{url="/my-applications";name="My Applications";desc="My applications"},
    @{url="/leases";name="Leases";desc="Lease management"},
    @{url="/payments";name="Payments";desc="Payment history"},
    @{url="/expenses";name="Expenses";desc="Expense tracking"},
    @{url="/inspections";name="Inspections";desc="Property inspections"},
    @{url="/maintenance";name="Maintenance";desc="Maintenance requests"},
    @{url="/properties/new";name="Add Property";desc="Add new property"},
    @{url="/properties/123";name="Property Detail";desc="Property detail page"}
)

$results = @()
foreach ($p in $pages) {
    $err = $false
    $status = 0
    $time = 0
    try {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        $r = Invoke-WebRequest -Uri "http://localhost:3000$($p.url)" -TimeoutSec 15 -UseBasicParsing
        $sw.Stop()
        $status = $r.StatusCode
        $time = $sw.ElapsedMilliseconds

        if ($r.StatusCode -ge 400) { $err = $true }
        if ($r.Content -match "error|Error|错误|exception|Exception" -and $r.StatusCode -eq 200) { $err = $true }
    } catch {
        $err = $true
        $status = 404
    }

    $results += [PSCustomObject]@{
        URL = $p.url
        Name = $p.name
        Status = $status
        LoadTime_ms = $time
        Error = if ($err) { "YES" } else { "NO" }
    }
}

$results | Format-Table -AutoSize

Write-Output "`n=== SUMMARY ==="
Write-Output "Total Pages: $($results.Count)"
Write-Output "Working: $(($results | Where-Object { $_.Error -eq 'NO' }).Count)"
Write-Output "Broken: $(($results | Where-Object { $_.Error -eq 'YES' }).Count)"
Write-Output "Avg Load Time: $([math]::Round(($results | Measure-Object -Property LoadTime_ms -Average).Average, 0)) ms"
