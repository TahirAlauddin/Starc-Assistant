# Starc Assistant Client

## Overview

The Starc Assistant Client is a desktop application built with ElectronJS, showcasing a responsive interface made with HTML, CSS, and JavaScript. It is specifically tailored for the Windows operating system, ensuring compatibility across a wide range of devices. This client acts as the front-end to the Starc Assistant ecosystem, interfacing with the Starc Assistant Server to deliver real-time support and information to the employees of Gentilini Power-Train.

## Features

- **Responsive Design**: Compatible with a variety of devices and screen sizes.
- **User-Friendly Interface**: Easy-to-navigate UI, offering a seamless experience.
- **Real-Time Communication**: Instant interaction with the backend server for up-to-date assistance.
- **Multimedia Support**: Access to instructional videos and support materials.

## Screenshots

For a visual tour of the Starc Assistant Client, check out the [Screenshots Folder](./screenshots/).

## Installation

### Prerequisites

- Windows 7 or later.
- Active connection to a Starc Assistant Server instance.

### Steps

1. Download the latest version of the client from the [Releases page](#).
2. Run the installer and follow the on-screen prompts to complete the installation.
3. Once installed, open the application through the created desktop shortcut.

## User Guide

For detailed instructions on how to use the Starc Assistant Client, refer to the [User Guide](#).

## For Developers

### Getting Started

1. Ensure you have [Node.js](https://nodejs.org/en/) installed on your system.
2. Clone this repository to your local machine.
3. Navigate to the project directory and install dependencies:
   ```bash
   npm install
   ```
4. To run the application locally:
   ```bash
   npm start
   ```

### Building for Production

To build the application for Windows:
```bash
npx electron-packager . StarcAssistant --platform=win32 --arch=x64 --icon=static/images/starc-logo-icon.png --overwrite
```

For more detailed instructions on setting up the development environment, building, and packaging the application, please refer to the [Developer Guide](#).

## Contributing

We encourage contributions! Please read through our [Contribution Guidelines](CONTRIBUTING.md) for details on the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

Need help? Contact [support@starcassistant.com](mailto:support@starcassistant.com) or open an issue in the [Issue Tracker](#).

## Acknowledgements

- **Gentilini Power-Train**: For the inspiration and support.
- **Contributors**: Thank you to all who have contributed to making Starc Assistant Client a reality.

