const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const logger = require("electron-log");

let mainWindow;

autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = 'info';
logger.info('App starting...');

// autoUpdater.autoDownload = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    message: `update available`,
  });
  mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    message: `update downloaded`,
  });
  mainWindow.webContents.send("update_downloaded");
});

autoUpdater.on("error", (error) => {
  dialog.showMessageBox({
    message: `error while updating ${error}`,
  });
  autoUpdater.logger.debug(error);
});
