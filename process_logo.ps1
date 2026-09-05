$src = Join-Path $PSScriptRoot 'logo.png'
$dst = Join-Path $PSScriptRoot 'logo_transparent.png'
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($src)
$bitmap = New-Object System.Drawing.Bitmap $img
for ($y = 0; $y -lt $bitmap.Height; $y++) {
  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    $pixel = $bitmap.GetPixel($x, $y)
    if ($pixel.A -eq 0) { continue }
    if ($pixel.R -gt 240 -and $pixel.G -gt 240 -and $pixel.B -gt 240) {
      $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
    }
  }
}
$bitmap.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
$img.Dispose()
Copy-Item $dst $src -Force
Write-Host "Processed logo to $src"
