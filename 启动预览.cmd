@echo off
cd /d "%~dp0"
echo ALMS preview: http://127.0.0.1:8765/
echo Keep this window open while browsing. Close it to stop the preview.
start "" "http://127.0.0.1:8765/"
"C:\Python314\python.exe" -P -m http.server 8765 --bind 127.0.0.1 --directory "%~dp0."
pause
