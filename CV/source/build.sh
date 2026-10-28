#!/bin/bash
# Render the CV (and optionally the cover letter) to PDF with headless Chrome.
# Usage: ./build.sh            -> CV only, copied to the portfolio
#        ./build.sh letter     -> also renders cover-letter.html (not copied to the portfolio)
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SRC="$(cd "$(dirname "$0")" && pwd)"
OUT="$SRC/.."
PORTFOLIO="$SRC/../../reddang.github.io/assets"

render() {
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$2" "file://$SRC/$1" 2>/dev/null
  echo "Rendered $2"
}

render cv.html "$OUT/CV_dangvuongquang@gmail.com_0946858455.pdf"
cp "$OUT/CV_dangvuongquang@gmail.com_0946858455.pdf" "$PORTFOLIO/CV_dangvuongquang@gmail.com_0946858455.pdf"
echo "Copied to $PORTFOLIO/CV_dangvuongquang@gmail.com_0946858455.pdf"

if [[ "${1:-}" == "letter" ]]; then
  render cover-letter.html "$OUT/Red-Dang-Cover-Letter.pdf"
fi
