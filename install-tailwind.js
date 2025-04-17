// This is a Node.js script to update package.json
const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, 'package.json');

// Read package.json
const packageJson = require(packageJsonPath);

// Add tailwindcss, postcss, and autoprefixer to devDependencies
packageJson.devDependencies = {
  ...packageJson.devDependencies,
  'tailwindcss': '^3.3.0',
  'postcss': '^8.4.24',
  'autoprefixer': '^10.4.14'
};

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Updated package.json with tailwindcss, postcss, and autoprefixer');
