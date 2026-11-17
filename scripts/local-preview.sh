#!/usr/bin/env bash
# Локальный просмотр сайта amvoice (текущая ветка в git).
# Дважды щёлкните: local-preview.command (macOS) или запустите этот файл в терминале.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
PORT="${AMVOICE_PORT:-8765}"
URL="http://127.0.0.1:${PORT}/hronometr/"

echo "Каталог: $ROOT"
if command -v git >/dev/null 2>&1; then
  echo "Ветка:   $(git branch --show-current 2>/dev/null || echo '—')"
fi
echo ""
echo "Откроется: $URL"
echo "Главная:   http://127.0.0.1:${PORT}/"
echo "Остановка: Ctrl+C в этом окне"
echo ""

PY=""
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
elif command -v py >/dev/null 2>&1; then
  PY="py -3"
fi

if [[ -z "$PY" ]]; then
  echo "Не найден Python 3 (нужен для: python3 -m http.server)." >&2
  read -r -p "Нажмите Enter, чтобы закрыть…" _
  exit 1
fi

(
  sleep 0.6
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
    open "$URL" || true
  fi
) &

if [[ "$PY" == "py -3" ]]; then
  py -3 -m http.server "$PORT" --bind 127.0.0.1
else
  "$PY" -m http.server "$PORT" --bind 127.0.0.1
fi