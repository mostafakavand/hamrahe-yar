import { registerPlugin } from '@capacitor/core';

const SaveFile = registerPlugin('SaveFile');

window.SaveFile = SaveFile;

console.log('SaveFile native plugin registered.');