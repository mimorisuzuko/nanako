const electron = require('electron');
const { app, BrowserWindow } = electron;
const libpath = require('path');
const { env: { NODE_ENV } } = process;
const {
	default: installExtension,
	REACT_DEVELOPER_TOOLS
} = require('electron-devtools-installer');
const Manager = require('./WindowManager');

const manager = new Manager();
/** @type {Electron.BrowserWindow} */
let mainWindow = null;
/** @type {Electron.BrowserWindow} */
let pickerWindow = null;

const create = () => {
	const { screen } = electron;
	const { workAreaSize: { width, height } } = screen.getPrimaryDisplay();

	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		titleBarStyle: 'hidden'
	});
	mainWindow.loadURL(
		NODE_ENV === 'development'
			? 'http://localhost:3000/main'
			: `file://${libpath.join(__dirname, 'dst/main/index.html')}`
	);
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	pickerWindow = new BrowserWindow({
		width,
		height,
		transparent: true,
		frame: false,
		toolbar: false,
		show: false,
		x: 0,
		y: 0,
		webPreferences: {
			webSecurity: false
		}
	});
	pickerWindow.loadURL(
		NODE_ENV === 'development'
			? 'http://localhost:3000/picker'
			: `file://${libpath.join(__dirname, 'dst/picker/index.html')}`
	);
	pickerWindow.on('closed', () => {
		pickerWindow = null;
	});

	manager.register('main', mainWindow);
	manager.register('picker', pickerWindow);
};

app.on('ready', () => {
	create();
	installExtension(REACT_DEVELOPER_TOOLS).catch(console.error);
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		create();
	}
});

module.exports = manager;
