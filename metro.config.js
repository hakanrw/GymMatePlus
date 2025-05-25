const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude AI directory from Metro bundler
config.resolver.blockList = [
  /app\/ai\/.*/,
  /.*\/ai_env\/.*/,
  /.*\/node_modules\/.*\/debug\/.*/,
  /.*debugger\.js$/
];

// Ignore AI directory in file watching
config.watchFolders = config.watchFolders || [];
config.watchFolders = config.watchFolders.filter(folder => !folder.includes('/ai'));

module.exports = config; 