// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { ethers } = require("ethers");
const fs = require('fs');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 监听从渲染进程发来的“选择文件夹”的请求
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});

// 监听从渲染进程发来的“开始生成”的请求
ipcMain.handle('generate-wallets', async (event, options) => {
    const { count, columns, savePath } = options;
    const outputFile = path.join(savePath, 'wallets_backup.csv');

    try {
        let header = 'Index';
        if (columns.address) header += ',Address';
        if (columns.mnemonic) header += ',Mnemonic';
        if (columns.privateKey) header += ',PrivateKey';
        header += '\n';

        fs.writeFileSync(outputFile, header);

        for (let i = 0; i < count; i++) {
            const wallet = ethers.Wallet.createRandom();
            let csvLine = `${i + 1}`;
            if (columns.address) csvLine += `,${wallet.address}`;
            if (columns.mnemonic) csvLine += `,"${wallet.mnemonic.phrase}"`;
            if (columns.privateKey) csvLine += `,${wallet.privateKey}`;
            csvLine += '\n';
            fs.appendFileSync(outputFile, csvLine);

            // 向渲染进程发送进度更新
            event.sender.send('generation-progress', {
                current: i + 1,
                total: count,
                message: `已生成第 ${i + 1} 个钱包...`
            });
        }
        return { success: true, path: outputFile };
    } catch (error) {
        return { success: false, message: error.message };
    }
});