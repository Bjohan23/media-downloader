const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Habilitar Hermes para mejor performance
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
