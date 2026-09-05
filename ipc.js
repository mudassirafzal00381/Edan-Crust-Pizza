// Registers ipcMain.handle for every db.js function, under a 'db:' channel prefix,
// plus system handlers for printing, backups, and file exports.
const { ipcMain, dialog, BrowserWindow } = require('electron');
const fs = require('fs');

function registerIpcHandlers(db) {
  const handlers = {
    'db:getMenuItems': () => db.getMenuItems(),
    'db:saveMenuItems': (e, items) => db.saveMenuItems(items),
    'db:getMenuCategories': () => db.getMenuCategories(),
    'db:saveMenuCategories': (e, cats) => db.saveMenuCategories(cats),

    'db:getDeals': () => db.getDeals(),
    'db:saveDeals': (e, deals) => db.saveDeals(deals),

    'db:getTables': () => db.getTables(),
    'db:saveTables': (e, tables) => db.saveTables(tables),

    'db:getOrders': () => db.getOrders(),
    'db:saveOrders': (e, orders) => db.saveOrders(orders),

    'db:getUnpaidBills': () => db.getUnpaidBills(),
    'db:saveUnpaidBills': (e, bills) => db.saveUnpaidBills(bills),

    'db:getInventory': () => db.getInventory(),
    'db:saveInventory': (e, inv) => db.saveInventory(inv),

    'db:getEmployees': () => db.getEmployees(),
    'db:saveEmployees': (e, emps) => db.saveEmployees(emps),

    'db:getPettyCash': () => db.getPettyCash(),
    'db:savePettyCash': (e, pc) => db.savePettyCash(pc),

    'db:getSalesLedger': () => db.getSalesLedger(),
    'db:saveSalesLedger': (e, sl) => db.saveSalesLedger(sl),

    'db:getExpenseLedger': () => db.getExpenseLedger(),
    'db:saveExpenseLedger': (e, el) => db.saveExpenseLedger(el),

    'db:getSettings': () => db.getSettings(),
    'db:saveSettings': (e, s) => db.saveSettings(s),

    'db:isEmpty': () => db.isDbEmpty(),
    'db:clearAllData': () => db.clearAllData(),
    'db:migrateFromLocalStorage': (e, legacy) => db.migrateFromLocalStorage(legacy),

    // ── DATABASE BACKUP ──
    'db:backup': async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: "Backup Eden's Crust Database",
          defaultPath: `edens-crust-backup-${today}.db`,
          filters: [
            { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        if (canceled || !filePath) return { success: false, canceled: true };
        await db.backupDatabase(filePath);
        return { success: true, filePath };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    // ── CSV REPORT EXPORT ──
    'file:saveCSV': async (e, { defaultName, content }) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Save CSV Report',
          defaultPath: defaultName || 'hfc-report.csv',
          filters: [
            { name: 'CSV Document (*.csv)', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        if (canceled || !filePath) return { success: false, canceled: true };
        fs.writeFileSync(filePath, content, 'utf8');
        return { success: true, filePath };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    // ── THERMAL / SILENT RECEIPT PRINTING ──
    'print:getPrinters': async (event) => {
      try {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return [];
        return await win.webContents.getPrintersAsync();
      } catch (err) {
        console.error('Failed to get printers:', err);
        return [];
      }
    },

    'print:receipt': async (event, html, options = {}) => {
      return new Promise((resolve) => {
        try {
          const printWin = new BrowserWindow({
            show: false,
            webPreferences: { nodeIntegration: false, contextIsolation: true }
          });

          const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
          printWin.loadURL(dataUrl);

          printWin.webContents.on('did-finish-load', () => {
            const printOptions = {
              silent: options.silent !== false,
              printBackground: true,
              margins: { marginType: 'none' }
            };
            if (options.deviceName) {
              printOptions.deviceName = options.deviceName;
            }

            printWin.webContents.print(printOptions, (success, failureReason) => {
              try { printWin.destroy(); } catch (e) {}
              if (success) {
                resolve({ success: true });
              } else {
                resolve({ success: false, error: failureReason });
              }
            });
          });

          printWin.webContents.on('did-fail-load', (e, code, desc) => {
            try { printWin.destroy(); } catch (err) {}
            resolve({ success: false, error: desc });
          });
        } catch (err) {
          resolve({ success: false, error: err.message });
        }
      });
    },
  };

  for (const [channel, handler] of Object.entries(handlers)) {
    ipcMain.handle(channel, handler);
  }
}

module.exports = { registerIpcHandlers };

