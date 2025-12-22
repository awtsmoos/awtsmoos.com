
// B"H
import { buildApp } from './ui_layout/app_builder.js';
import { bootstrap } from './app.js';

console.log("B\"H - Genesis");

// 1. Create the World
buildApp();

// 2. Breathe Life
document.body.classList.remove('loading');
bootstrap();
