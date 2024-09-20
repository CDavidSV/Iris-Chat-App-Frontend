export const clearLocalStorage = (...keyName: string[]) => {
    if (keyName.length === 0) {
        localStorage.clear();
    }
    
    for (const key of keyName) {
        localStorage.removeItem(key);
    }
}