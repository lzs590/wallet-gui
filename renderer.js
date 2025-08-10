// renderer.js
const walletCountInput = document.getElementById('wallet-count');
const colAddressCheckbox = document.getElementById('col-address');
const colMnemonicCheckbox = document.getElementById('col-mnemonic');
const colPrivateKeyCheckbox = document.getElementById('col-privatekey');
const savePathInput = document.getElementById('save-path');
const browseBtn = document.getElementById('browse-btn');
const generateBtn = document.getElementById('generate-btn');
const logArea = document.getElementById('log-area');
const statusDiv = document.getElementById('status');

browseBtn.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFolder();
    if (path) {
        savePathInput.value = path;
    }
});

generateBtn.addEventListener('click', async () => {
    const options = {
        count: parseInt(walletCountInput.value, 10),
        columns: {
            address: colAddressCheckbox.checked,
            mnemonic: colMnemonicCheckbox.checked,
            privateKey: colPrivateKeyCheckbox.checked,
        },
        savePath: savePathInput.value,
    };

    if (!options.savePath) {
        log('错误: 请先选择保存位置！', true);
        return;
    }

    log('开始生成，请稍候...', false, true);
    generateBtn.disabled = true;
    statusDiv.innerText = '状态: 正在生成...';

    const result = await window.electronAPI.generateWallets(options);

    if (result.success) {
        log(`\n✅ 生成成功! 文件已保存至: ${result.path}`);
        statusDiv.innerText = '状态: 生成成功！';
    } else {
        log(`\n❌ 生成失败: ${result.message}`, true);
        statusDiv.innerText = '状态: 失败';
    }

    generateBtn.disabled = false;
});

window.electronAPI.onProgress((data) => {
    log(data.message);
    statusDiv.innerText = `状态: 正在生成 ${data.current}/${data.total}`;
});

function log(message, isError = false, clear = false) {
    if (clear) {
        logArea.textContent = '';
    }
    logArea.textContent += message + '\n';
    if (isError) {
        console.error(message);
    }
    logArea.scrollTop = logArea.scrollHeight; // 自动滚动到底部
}