/**
 * Manual Cleanup Script
 * Run this to immediately clean all temporary files and cache
 * 
 * Usage: node scripts/cleanup.js
 */

const path = require('path');

// Setup path to utils
const utilsPath = path.join(__dirname, '../src/utils/cleanupUtils');
const { runCleanup } = require(utilsPath);

console.log('🧹 PipeWipe Manual Cleanup');
console.log('==========================\n');

// Run cleanup with aggressive settings (clean everything)
runCleanup({
  cleanedMaxAge: 0,     // Delete all files from /cleaned
  uploadsMaxAge: 0,     // Delete all files from /uploads  
  cleanCache: true,     // Delete all ExifTool cache folders
})
  .then((results) => {
    console.log('\n✅ Cleanup completed successfully!\n');
    console.log('Results:');
    console.log('--------');
    console.log(`  Cleaned files:   ${results.cleaned.deleted} deleted (${results.cleaned.scanned} scanned)`);
    console.log(`  Uploaded files:  ${results.uploads.deleted} deleted (${results.uploads.scanned} scanned)`);
    console.log(`  Cache folders:   ${results.cache.deleted} deleted (${results.cache.scanned} scanned)`);
    console.log(`\n  Total: ${results.cleaned.deleted + results.uploads.deleted + results.cache.deleted} items removed`);
    console.log(`  Duration: ${results.duration}ms\n`);
    
    if (results.cleaned.failed + results.uploads.failed + results.cache.failed > 0) {
      console.log('⚠️  Some items failed to delete:');
      console.log(`   Failed: ${results.cleaned.failed + results.uploads.failed + results.cache.failed} items`);
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
