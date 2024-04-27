@REM @echo off

rem Activate the virtual environment
call venv\Scripts\activate.bat


rem Run the Django server
python manage.py runserver

pause
