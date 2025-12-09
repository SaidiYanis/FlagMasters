export function registerCountriesIpc(ipcMain, countriesService) {
  ipcMain.handle('countries:list', async () => {
    return countriesService.list();
  });
}
