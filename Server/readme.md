
# Starc Assistant Server

## Overview

Starc Assistant is a robust desktop server application designed to augment the support mechanism for Gentilini Power-Train's employees. By integrating an AI-powered chatbot, it proficiently provides real-time, Italian-language text responses and instructional videos. This tailored assistance is focused on specific departmental inquiries and equipment usage, streamlining operational efficiency and knowledge management.

### Key Features

- **Intelligent Chatbot**: Delivers immediate, context-aware support in Italian.
- **Multimedia Support**: Offers a suite of instructional videos for enhanced understanding.
- **Customized Assistance**: Provides department-specific information and equipment guidance.
- **Dynamic Knowledge Base**: Enables administrators to update and manage content efficiently.

## Quick Start

### Installation for Users

1. **Download**: Access the latest release from the [Releases page](#).
2. **Install**: Execute the installer and follow the on-screen prompts.
3. **Launch**: Start the server via the desktop shortcut and begin interacting with the assistant.

### Setup for Developers

1. **Repository**: Clone or fork this repository.
2. **Environment**: Set up a Python virtual environment and activate it:
   ```bash
   pipenv shell
   ```
3. **Dependencies**: Install the required dependencies:
   ```bash
   pipenv install
   ```
4. **Environment Variables**: Configure the necessary `.env` file (refer to the template below).
5. **Database**: Run migrations to set up the database schema:
   ```bash
   python manage.py migrate
   ```
6. **Server**: Launch the development server on your local machine:
   ```bash
   python manage.py runserver
   ```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following structure:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
SECRET_KEY=your_secret_key
DEBUG=True # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1 # Add your production server here
```

### Packaging the Application

Use PyInstaller to package the server into a standalone executable:

```bash
pyinstaller --name=starc_assistant_server --onefile --additional-hooks-dir=hooks --add-data="static;static" manage.py
```

## Documentation

For a deep dive into the functionalities and architecture of Starc Assistant, refer to the [Wiki](#).
## Acknowledgements

- **Developers**: List of developers and maintainers.
- **Contributors**: Special thanks to [Contributors](https://github.com/your-username/starc-assistant/contributors) who have invested time in improving this tool.
- **Community**: Thanks to the Gentilini Power-Train community for their continual support and feedback.

## See Also

- [User Guide](#): Comprehensive manual for end-users.
- [Developer Documentation](#): In-depth setup and development guidelines.
- [FAQs](#): Frequently Asked Questions.
