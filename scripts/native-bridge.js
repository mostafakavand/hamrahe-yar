import { registerPlugin } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Media } from '@capacitor-community/media';

const SaveFile = registerPlugin('SaveFile');

// حفظ اتصال پشتیبان‌گیری که قبلاً با موفقیت آزمایش شد
window.SaveFile = SaveFile;

// ابزارهای بومی موردنیاز برای مدیریت تصویر JPEG
window.HamrahNative = {
    Share,
    Filesystem,
    Directory,
    Media
};

console.log('Hamrah Yar native plugins registered.');