const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
require('dotenv').config()
let mainWindow;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: true
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

        { label: 'Edit',
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

    // mainWindow.loadFile('training/training-view/training-view.html');
    mainWindow.loadFile('home/welcome/index.html');
    // mainWindow.loadFile('training/training.html');
    // mainWindow.loadFile('admin/admin-panel.html');
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


app.on('ready', createWindow);

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
        console.log(BASE_URL)
        path = resolve(`${base_path}/pages/login/index.html`)
        mainWindow.loadFile(path);    
    } else if (page == 'admin') {
        path = `${BASE_URL}/admin/`
        
        const urlRegex = /^(http:\/\/|https:\/\/)?(([\da-z.-]+)\.([a-z.]{2,6})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))([\/\w .-]*)*\/?$/;

        console.log(BASE_URL)
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

