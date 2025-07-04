#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function removeCommentsFromTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  let result = content
    .replace(/\/\*(?!\s*eslint-)[\s\S]*?\*\//g, '')
    .replace(/\/\/(?!\s*eslint-).*$/gm, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s*\n/gm, '')
    .replace(/\n\s*$/g, '\n');
  
  return result;
}

function removeTestComments() {
  try {
    const findCommand = 'find . -name "*.test.ts" -path "*/src/*" -not -path "*/node_modules/*"';
    const testFilesOutput = execSync(findCommand, { encoding: 'utf8' });
    const projectTestFiles = testFilesOutput.trim().split('\n').filter(file => file.length > 0);

    
    for (const filePath of projectTestFiles) {
      
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const newContent = removeCommentsFromTypeScriptFile(filePath);
      
      if (originalContent !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      } else {
      }
    }
    
    
  } catch (error) {
    process.exit(1);
  }
}

if (require.main === module) {
  removeTestComments();
}

module.exports = { removeCommentsFromTypeScriptFile, removeTestComments };