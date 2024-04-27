import subprocess

def run_django_server():
    subprocess.Popen(['runserver.bat'], creationflags=subprocess.CREATE_NO_WINDOW)

if __name__ == "__main__":
    run_django_server()
