const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const logger = require("electron-log");

let mainWindow;
autoUpdater.autoDownload = false;
// const cancellationToken = new CancellationToken();

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
    autoUpdater.checkForUpdates();
  });
}

function manualUpdate() {
  dialog.showMessageBox({
    message: `manual updated started`,
  });
  autoUpdater.downloadUpdate();
}

app.on("ready", () => {
  createWindow();

  autoUpdater.checkForUpdates();
  // autoUpdateConfig();
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

autoUpdater.on("update-available", (info) => {
  const options = {
    type: "question",
    title: "App Update",
    message: `Version: ${info.version}`,
    buttons: ["Upgrade now", "Ask me later"],
  };

  dialog.showMessageBox(options).then((result) => {
    if (result.response === 0) {
      manualUpdate();
    }
  });

  // dialog.showMessageBox({
  //   message: `update available`,
  // });
  // manualUpdate();
  // mainWindow.webContents.send("update_available");
});

// autoUpdater.on("download-progress", (progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + " - Downloaded " + progressObj.percent + "%";
//   log_message =
//     log_message +
//     " (" +
//     progressObj.transferred +
//     "/" +
//     progressObj.total +
//     ")";
//   dialog.showMessageBox({
//     message: log_message,
//   });
// });

autoUpdater.on("update-downloaded", () => {
  const options = {
    type: "question",
    title: "Restart App",
    message: `Do you want to restart now`,
    buttons: ["Restart", "Close"],
  };

  dialog.showMessageBox(options).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  // dialog.showMessageBox({
  //   message: `update downloaded`,
  // });
  // mainWindow.webContents.send("update_downloaded");
});

autoUpdater.on("error", (error) => {
  dialog.showMessageBox({
    message: `error while updating ${error}`,
  });
});
