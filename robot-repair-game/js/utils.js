// js/utils.js
// Funções utilitárias

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function makeCode(len) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}


