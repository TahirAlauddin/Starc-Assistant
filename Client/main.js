const { ipcMain, app, BrowserWindow, Menu, globalShortcut, dialog } = require('electron');
let resolve = require('path').resolve
const fs = require('fs');
const path = require('path');
const os = require('os');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Replace hard-coded AWS credentials with environment variables
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

// Configure AWS SDK with your credentials
AWS.config.update({ accessKeyId, secretAccessKey });

let BASE_URL;
let trainingStatusInterval = null;


const starcAssistantFolderPath = path.join(os.homedir(), 'StarcAssistant');

// Ensure the StarcAssistant folder exists
if (!fs.existsSync(starcAssistantFolderPath)) {
    fs.mkdirSync(starcAssistantFolderPath);
}

// This will create a path to "ipAddress.txt" inside a ".StarcAssistant" directory within the user's home directory
const ipFilePath = path.join(starcAssistantFolderPath, 'ipAddress.txt');
require('dotenv').config()

let mainWindow;
const isDev = process.env.NODE_ENV === 'development';
let runningAsPackaged = false;

if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
    // Running in development mode (with npm run or electron .)
} else {
    // Running as a packaged application
    runningAsPackaged = true;
}
 
function disableApp() {
    app.quit()
}

function checkAndDisableApp() {
    const s3 = new AWS.S3();
    const bucketName = 'starcassistant';
    const directoryName = 'starc-assistant-client/';
  
    // Define parameters for listing objects in the bucket
    const params = {
      Bucket: bucketName,
      Prefix: directoryName
    };
    
    // List objects in the bucket
    s3.listObjectsV2(params, async (err, data) => {
      if (err) {
        console.error('Error listing objects:', err);
        return;
      }
  
      // Check the retrieved objects to decide on app behavior
      if (data.Contents.length > 0) {
        // Logic to handle app deactivation based on specific conditions
        console.log('App deactivation condition met.');
        disableApp()
      } else {
        console.log('No relevant objects found in the bucket.');
      }
    });
}
checkAndDisableApp()

  
function updateIpAddress() {
    if (fs.existsSync(ipFilePath)) {
        fs.unlinkSync(ipFilePath);
    }
    createInputWindow()
}

function createInputWindow() {
    let inputWin = new BrowserWindow({
        width: 400,
        height: 200,
        icon: 'images/logo.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity, disabled. Consider security implications.
            enableRemoteModule: true, // Explicitly enable the remote module
        },
    });

    inputWin.loadFile('config/index.html'); // Load the HTML file with your form

    ipcMain.once('save-ip', (event, ip) => {
        fs.mkdirSync(path.dirname(ipFilePath), { recursive: true }); // Ensure the directory exists
        fs.closeSync(fs.openSync(ipFilePath, 'a')); // Create the file if it doesn't exist

        fs.writeFileSync(ipFilePath, ip); // Save IP to a file
        BASE_URL = `http://localhost:8000`; // Use the function to set BASE_URL
        BASE_URL = `http://${ip}:8000`; // Use the function to set BASE_URL

        createWindow(); // You should create the main window here only if it's not already created
        inputWin.close(); // Close the window after saving
    });

    inputWin.on('closed', () => {
        inputWin = null; // Dereference the object to prevent memory leaks
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity, disabled. Consider security implications.
            enableRemoteModule: true, // Explicitly enable the remote module
        }
    });

    mainWindow.maximize()

    // Create a custom menu (an example menu without developer tools)
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },

        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // Add other menus as needed
    ];

    // Set the application menu
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile('home/welcome/index.html');
    // mainWindow.loadFile('training/training-view/training-view.html');
    // mainWindow.loadFile('training/training.html');
    // mainWindow.loadFile('admin/admin-panel.html');
    // mainWindow.loadFile('admin/previous-topic/previous-topic.html');
    // mainWindow.loadFile('login/login.html');
    // mainWindow.loadFile('machines/machine.html');
    // mainWindow.loadFile('machines/machine-detail.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });


    // Register the 'Ctrl + W' shortcut
    mainWindow.on('focus', () => {
        globalShortcut.register('Ctrl+W', () => {
            // Close the specific window, or use app.quit() to quit the app
            mainWindow.close(); // Adjust as needed
        });
    });

    mainWindow.on('blur', () => {
        globalShortcut.unregister('Ctrl+W');
    });

    app.on('will-quit', () => {
        // Unregister all shortcuts
        globalShortcut.unregisterAll();
    });

}


app.on('ready', () => {

    if (fs.existsSync(ipFilePath)) {
        // If the IP address file exists, read it (optional here)
        const Ip = fs.readFileSync(ipFilePath, 'utf8');
        BASE_URL = `http://localhost:8000`; 
        BASE_URL = `http://${Ip}:8000`; 

        createWindow(); // Open the main app window
    } else {
        createInputWindow(); // Open the input window to set the IP address
    }
});


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});


// Listen for the navigate message from the renderer process
app.on('navigate', (event, page, args) => {

    let path;
    if (runningAsPackaged == true) {
        base_path = './resources/app/src'
    } else {
        base_path = './'
    }
    if (page == 'training') {
        path = resolve(`${base_path}/admin/admin-panel.html`)
        mainWindow.loadFile(path);
    }
    else if (page == 'invoices') {
        path = resolve(`${base_path}/pages/invoices/index.html`)
        mainWindow.loadFile(path);
    }
    else if (page == 'customers') {
        path = resolve(`${base_path}/pages/customers/index.html`)
        mainWindow.loadFile(path);
    }
    else if (page == 'order-detail') {
        path = resolve(`${base_path}/pages/order-detail/index.html`)
        mainWindow.loadFile(path);
        // Send the arguments to the renderer process
        mainWindow.webContents.once('did-finish-load', () => {
            mainWindow.webContents.send('page-data', args);
        });
    }
    else if (page == 'login') {
        path = resolve(`${base_path}/pages/login/index.html`)
        mainWindow.loadFile(path);
    } else if (page == 'admin') {
        path = `${BASE_URL}/admin/`

        const urlRegex = /^(http:\/\/|https:\/\/)?(([\da-z.-]+)\.([a-z.]{2,6})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))([\/\w .-]*)*\/?$/;

        // Validate the base URL provided by the user
        if (!urlRegex.test(BASE_URL.split(':8000')[0])) {
            dialog.showErrorBox('title', 'Invalid URL provided by the user.')
            return; // Exit the function if the URL is invalid
        }

        // Ensure the URL starts with http:// or https://
        let validatedUrl = BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')
            ? BASE_URL
            : `${BASE_URL}`;

        path = `${validatedUrl}/admin/`;

        // Create a new BrowserWindow instance
        let newWindow = new BrowserWindow({
            width: 800, // Set the width of the new window
            height: 600, // Set the height of the new window
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false, // Adjust according to your security needs
            }
        });
        // Load the URL in the new window
        newWindow.loadURL(path);
        // Optional: Clear the newWindow variable when the window is closed
        newWindow.on('closed', () => {
            newWindow = null;
        });
    }
});


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


app.on('activate', function () {
    // This logic assumes mainWindow is your main app window
    // Adjust accordingly if your app has different requirements
    if (mainWindow === null) {
        if (fs.existsSync(ipFilePath)) {
            createWindow();
        } else {
            createInputWindow();
        }
    }
});

ipcMain.on('update-ip', (event, ip) => {
    updateIpAddress()
    mainWindow.close()
})

ipcMain.on('show-message-box', (event, options) => {
    dialog.showMessageBox(mainWindow, options).then((response) => {
        event.reply('message-box-response', response);
    });
});



function startTrainingModel() {
    // Start model training logic here...
    console.log("Training started.");
    // Start polling when training starts
    if (!trainingStatusInterval) {
        trainingStatusInterval = setInterval(checkModelTrainingStatus, 10000);
    }
}

function stopTrainingModel() {
    // Logic to stop model training if applicable
    console.log("Training stopped or completed.");
    // Stop polling when training is not needed
    if (trainingStatusInterval) {
        clearInterval(trainingStatusInterval);
        trainingStatusInterval = null;
    }
}

function showTrainingCompleteDialog() {
    const options = {
        type: 'info',
        title: 'Training Complete',
        message: 'Model training has completed successfully.',
        buttons: ['OK']
    };
    dialog.showMessageBox(null, options).then(result => {
        console.log('Dialog result:', result.response);
    }).catch(err => {
        console.error('Dialog error:', err);
    });
}

function checkModelTrainingStatus() {
    console.log(BASE_URL)
    fetch(`${BASE_URL}/check-training-status`)
        .then(response => response.json())
        .then(data => {
            if (data.is_trained) {
                showTrainingCompleteDialog();
                stopTrainingModel(); // Stop polling after model is trained
                ipcMain.emit('model-trained'); // Notify other parts of your application
            }
        })
        .catch(error => {
            console.error('Error checking training status:', error);
        });
}

// IPC listeners that could be triggered from renderer processes
ipcMain.on('start-training', (event) => {
    console.log("Method Started")
    startTrainingModel();
});

ipcMain.on('stop-training', (event) => {
    stopTrainingModel();
});