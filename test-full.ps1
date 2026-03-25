$r = Invoke-WebRequest -Uri "http://localhost:3000/properties/new" -TimeoutSec 10 -UseBasicParsing
Write-Output "Status: $($r.StatusCode)"
Write-Output "Headers: $($r.Headers)"
Write-Output "Content (first 500): $($r.Content.Substring(0, [Math]::Min(500, $r.Content.Length)))"
