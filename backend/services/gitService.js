const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Clones a public GitHub repository to a temporary workspace.
 * @param {string} repoPath - e.g. "facebook/react"
 * @returns {Promise<{tempDir: string, cleanup: Function}>}
 */
function cloneRepository(repoPath) {
  return new Promise((resolve, reject) => {
    // Generate a unique temporary directory name inside the OS temp directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devconsilium-'));
    const targetUrl = `https://github.com/${repoPath}.git`;

    // Execute shallow clone for maximum performance
    exec(`git clone --depth 1 ${targetUrl} "${tempDir}"`, (error, stdout, stderr) => {
      if (error) {
        // Clean up immediately on clone failure
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (_) {}
        return reject(new Error(`Failed to clone git repository: ${stderr || error.message}`));
      }

      // Return clone path and a self-contained cleanup helper method
      const cleanup = () => {
        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch (err) {
          console.error(`Failed to clean up directory ${tempDir}:`, err);
        }
      };

      resolve({ tempDir, cleanup });
    });
  });
}

module.exports = { cloneRepository };
