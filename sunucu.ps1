# Geçersiz (APIPA ve Loopback) adresleri filtrele
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127*" -and
    $_.IPAddress -notlike "169.254*" -and
    $_.InterfaceAlias -notlike "*Loopback*"
}

if ($null -eq $ips) {
    Write-Host "HATA: Gecerli bir yerel ag adresi bulunamadi!" -ForegroundColor Red
    Write-Host "Lutfen Wi-Fi baglantinizi kontrol edin." -ForegroundColor Yellow
    exit
}

$ip = ($ips | Select-Object -First 1).IPAddress

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://+:8080/")
$listener.Start()

Write-Host "----------------------------------------------------" -ForegroundColor Gray
Write-Host "   SERVETIM UYGULAMASI YEREL SUNUCUSU" -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Gray
Write-Host "Sunucu baslatildi! Telefonundan su adrese gir:" -ForegroundColor White
Write-Host ""
Write-Host "   http://$($ip):8080" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "Durdurmak icin: Ctrl+C" -ForegroundColor Yellow
Write-Host "----------------------------------------------------" -ForegroundColor Gray

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $path = $context.Request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        $file = "D:\Servetim Uygulamasi" + $path.Replace("/", "\")

        if (Test-Path $file -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($file)
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".json" { "application/json" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".ico"  { "image/x-icon" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            $bytes = [System.IO.File]::ReadAllBytes($file)
            $context.Response.ContentType = $mime
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $context.Response.StatusCode = 404
        }
    } catch { } finally {
        if ($null -ne $context) { $context.Response.Close() }
    }
}
