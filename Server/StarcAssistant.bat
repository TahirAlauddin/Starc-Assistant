@echo off
title StarcAssistantServer

:: Path to your virtual environment
set VENV_PATH=env

:: Activate the virtual environment
call %VENV_PATH%\Scripts\activate.bat

:loop
echo Starting Waitress server...

:: Run database migrations
python manage.py migrate

:: Ask the user if they want to run the populate_db command
set /p run_populate_db="Do you want to run the populate_db command? (yes/no): "

if /I "%run_populate_db%" == "yes" (
    python manage.py populate_db
) else (
    echo Skipping populate_db command...
)

:: Ask the user if they want to run the populate_db command
set /p run_collect_static="Do you want to run the collectstatic command? (yes/no): "

if /I "%run_collect_static%" == "yes" (
    python manage.py collectstatic
) else (
    echo Skipping collectstatic command...
)


waitress-serve --port=8000 StarcAssistantServer.wsgi:application

echo.
echo Waitress server stopped.
echo Press Ctrl+C to exit or wait 5 seconds to restart...
timeout /t 5 /nobreak
goto loop
