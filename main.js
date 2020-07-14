const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater, CancellationToken } = require("electron-updater");
const ProgressBar = require("electron-progressbar");
const logger = require("electron-log");

let mainWindow;
let progressBar;
const cancellationToken = new CancellationToken();
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
}

function manualUpdate() {
  dialog.showMessageBox({
    message: `manual updated started`,
  });
  autoUpdater.downloadUpdate(cancellationToken);
}

app.on("ready", () => {
  createWindow();

  autoUpdater.checkForUpdatesAndNotify().catch((e) => {
    console.log(e);
  });
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
      // manualUpdate();
      autoUpdater.downloadUpdate(cancellationToken);

      progressBar = new ProgressBar({
        browserWindow: {
          text: "Preparing data...",
          title: "App Update",
          webPreferences: {
            nodeIntegration: true,
          },
        },
      });

      progressBar.detail = "Downloading in progress...";
    }
  });

  // dialog.showMessageBox({
  //   message: `update available`,
  // });
  // manualUpdate();
  // mainWindow.webContents.send("update_available");
});

autoUpdater.on("download-progress", () => {
  progressBar.on("aborted", function () {
    cancellationToken.cancel();
    console.info(`aborted...`);
  });
});

autoUpdater.on("update-downloaded", () => {
  progressBar.setCompleted();

  progressBar.on("completed", function () {
    console.info(`completed...`);
    progressBar.detail = "Task completed. Exiting...";
  });

  const options = {
    type: "question",
    title: "Restart App",
    message: `Do you want to restart now`,
    buttons: ["Restart", "Close"],
  };
  dialog.showMessageBox(options).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
      // app.exit();
    }
  });
  // dialog.showMessageBox({
  //   message: `update downloaded`,
  // });
  // mainWindow.webContents.send("update_downloaded");
});

autoUpdater.on("error", (error) => {
  console.log(error);
});
