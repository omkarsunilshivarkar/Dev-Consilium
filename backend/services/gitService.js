const fs = require('fs');
const path = require('path');
const os = require('os');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

/**
 * Clones a public GitHub repository to a temporary workspace using isomorphic-git.
 * @param {string} repoPath - e.g. "facebook/react"
 * @returns {Promise<{tempDir: string, cleanup: Function}>}
 */
function cloneRepository(repoPath) {
  return new Promise((resolve, reject) => {
    try {
      // Generate a unique temporary directory name inside the OS temp directory
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devconsilium-'));
      const targetUrl = `https://github.com/${repoPath}.git`;

      // Execute shallow clone using isomorphic-git (pure JS git client)
      git.clone({
        fs,
        http,
        dir: tempDir,
        url: targetUrl,
        singleBranch: true,
        depth: 1
      })
      .then(() => {
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
      })
      .catch((error) => {
        // Clean up immediately on clone failure
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (_) {}
        reject(new Error(`Failed to clone git repository: ${error.message}`));
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { cloneRepository };
