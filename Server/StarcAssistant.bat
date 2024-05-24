@echo off
title StarcAssistantServer

:: Path to your virtual environment
set VENV_PATH=env

:: Activate the virtual environment
call %VENV_PATH%\Scripts\activate.bat

:loop
echo Starting Waitress server...

:: Ask the user if they want to run the populate_db command
set /p install_dependencies="Do you want to install the dependencies? (yes/no): "

if /I "%install_dependencies%" == "yes" (
    pip install -r requirements.txt
) else (
    echo Skipping installation...
)

:: Run database migrations
python manage.py migrate

:: Ask the user if they want to run the populate_db command
set /p run_populate_db="Do you want to run the populate_db command? (yes/no): "

if /I "%run_populate_db%" == "yes" (
    python manage.py populate_db
) else (
    echo Skipping populate_db command...
)

:: Ask the user if they want to run the createsuperuser command
set /p run_createsuperuser="Do you want to run the createsuperuser command? (yes/no): "

if /I "%run_createsuperuser%" == "yes" (
    python manage.py createsuperuser
) else (
    echo Skipping createsuperuser command...
)

:: Ask the user if they want to run the collectstatic command
set /p run_collect_static="Do you want to run the collectstatic command? (yes/no): "

if /I "%run_collect_static%" == "yes" (
    python manage.py collectstatic
) else (
    echo Skipping collectstatic command...
)

python manage.py runserver 0.0.0.0:8000
@REM waitress-serve --port=8000 StarcAssistantServer.wsgi:application

echo.
echo Waitress server stopped.
echo Press Ctrl+C to exit or wait 5 seconds to restart...
timeout /t 5 /nobreak
goto loop
