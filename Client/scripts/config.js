const fs = require('fs')
const os = require('os');
const path = require('path');

// This will create a path to "ipAddress.txt" inside a ".yourAppName" directory within the user's home directory
const ipFilePath = path.join(os.homedir(), 'StarcAssistant', 'ipAddress.txt');

// Now ipFilePath is available for use in your renderer process

const Ip = fs.readFileSync(ipFilePath, 'utf8');
console.log("filePath", ipFilePath)
// const Ip = "localhost";

// const BASE_URL = `http://localhost:8000`; // Use the function to set BASE_URL
const BASE_URL = `http://${Ip}:8000`; // Use the function to set BASE_URL

console.log(BASE_URL)