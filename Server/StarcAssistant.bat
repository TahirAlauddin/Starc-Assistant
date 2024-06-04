@echo off
title StarcAssistantServer

:: Path to your virtual environment
set VENV_PATH=env

:: Activate the virtual environment
call %VENV_PATH%\Scripts\activate.bat

:loop
echo Starting Server...


python manage.py runserver 0.0.0.0:8000

@REM waitress-serve --port=8000 StarcAssistantServer.wsgi:application

echo.
echo Waitress server stopped.
echo Press Ctrl+C to exit or wait 5 seconds to restart...
timeout /t 5 /nobreak
goto loop
