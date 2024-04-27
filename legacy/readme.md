pyinstaller --name=starc_assistant_server --onefile --additional-hooks-dir=hooks --add-data="static;static" --add-data="templates;templates" manage.py
pyinstaller --name=starc_assistant --onefile  main.py
