const fs = require('fs');
const path = require('path');

/**
 * Analyzes the file tree and extracts key configs/manifest content.
 * @param {string} tempDir - Path to the cloned repository folder
 * @returns {Object}
 */
function analyzeCodebase(tempDir, scope = 'all') {
  const fileTree = [];
  const configs = {};
  const candidateFiles = [];

  const targetConfigs = [
    'package.json',
    'readme.md',
    '.gitignore',
    '.env.example',
    'docker-compose.yml',
    'webpack.config.js',
    'vite.config.js',
    'vite.config.ts',
    'next.config.js',
    'eslint.config.js',
    '.eslintrc',
    '.eslintrc.json',
    'prettier.config.js',
    '.prettierrc',
    'schema.prisma',
    'server.js',
    'app.js',
    'index.js',
    '.github/workflows/main.yml',
    '.github/workflows/verify.yml'
  ];

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      if (item === '.git' || item === 'node_modules') return;

      const fullPath = path.join(currentDir, item);
      const relativePath = path.relative(tempDir, fullPath).replace(/\\/g, '/');
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        fileTree.push({
          path: relativePath,
          type: 'tree'
        });
        walk(fullPath);
      } else {
        const size = stats.size;
        fileTree.push({
          path: relativePath,
          type: 'blob',
          size: size
        });

        const lowerItem = item.toLowerCase();
        const ext = path.extname(lowerItem);
        const isSourceFile = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.html', '.css', '.json'].includes(ext);

        if (
          targetConfigs.includes(lowerItem) || 
          targetConfigs.includes(relativePath.toLowerCase()) || 
          (isSourceFile && !lowerItem.includes('package-lock.json'))
        ) {
          if (size < 150000) {
            candidateFiles.push({ relativePath, fullPath });
          }
        }
      }
    });
  }

  walk(tempDir);

  // Prioritize critical entrypoints and config files to maximize context efficiency
  const commonPriority = ['package.json', 'readme.md', '.gitignore', '.env.example'];

  candidateFiles.sort((a, b) => {
    const aName = a.relativePath.toLowerCase();
    const bName = b.relativePath.toLowerCase();
    
    // Common files always have absolute highest priority
    const aIsCommon = commonPriority.some(kw => aName.endsWith(kw)) ? 0 : 1;
    const bIsCommon = commonPriority.some(kw => bName.endsWith(kw)) ? 0 : 1;
    if (aIsCommon !== bIsCommon) {
      return aIsCommon - bIsCommon;
    }
    
    // Apply scope-specific priority keywords and directories
    let scopeKeywords = [];
    let scopeDirs = [];
    if (scope === 'arch') {
      scopeKeywords = ['router.js', 'router.ts', 'routes.js', 'routes.ts', 'model.js', 'model.ts', 'db.js', 'schema.prisma', 'drizzle.config.ts', 'controller.js', 'server.js', 'app.js', 'index.js'];
      scopeDirs = ['/routes/', '/controllers/', '/db/', '/models/', '/services/'];
    } else if (scope === 'ux') {
      scopeKeywords = ['.css', '.scss', '.html', '.jsx', '.tsx', 'tailwind.config.js', 'postcss.config.js', 'main.jsx', 'main.tsx', 'app.jsx', 'app.tsx'];
      scopeDirs = ['/components/', '/pages/', '/views/', '/layouts/'];
    } else if (scope === 'perf') {
      scopeKeywords = ['vite.config.js', 'vite.config.ts', 'webpack.config.js', 'next.config.js', 'index.html', 'main.jsx', 'main.tsx', 'app.jsx', 'app.tsx', 'index.js'];
      scopeDirs = ['/src/'];
    } else if (scope === 'sec') {
      scopeKeywords = ['middleware.js', 'auth.js', 'auth.ts', 'jwt.js', 'jwt.ts', 'cors.js', 'helmet.js', 'package.json'];
      scopeDirs = ['/middleware/', '/auth/'];
    } else {
      // For 'all' scope, fall back to general entrypoints
      scopeKeywords = ['server.js', 'app.js', 'index.js', 'app.jsx', 'app.tsx', 'schema.prisma', 'main.jsx', 'main.tsx'];
    }
    
    const aIsScopePriority = (scopeKeywords.some(kw => aName.endsWith(kw)) || scopeDirs.some(dir => aName.includes(dir))) ? 0 : 1;
    const bIsScopePriority = (scopeKeywords.some(kw => bName.endsWith(kw)) || scopeDirs.some(dir => bName.includes(dir))) ? 0 : 1;
    
    if (aIsScopePriority !== bIsScopePriority) {
      return aIsScopePriority - bIsScopePriority;
    }
    
    // Sort smaller paths first to favor shallow structures
    return a.relativePath.length - b.relativePath.length;
  });

  let totalCharsRead = 0;
  const maxTotalChars = 10000; // ~2500 tokens. Safely within the user's 12,000 tokens limit.

  candidateFiles.forEach(file => {
    if (totalCharsRead >= maxTotalChars) return;
    try {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const charsToRead = Math.min(content.length, maxTotalChars - totalCharsRead);
      if (charsToRead > 0) {
        configs[file.relativePath] = content.substring(0, charsToRead);
        totalCharsRead += charsToRead;
      }
    } catch (err) {
      console.error(`Failed to read prioritized file: ${file.relativePath}`, err);
    }
  });

  return { fileTree, configs };
}

/**
 * Performs local static analysis scans on the cloned folder and returns scores, debate, and playbook tickets.
 * @param {string} tempDir - Sandbox repository folder
 * @param {string} repoName - Repository name (e.g. "facebook/react")
 * @returns {Object}
 */
function auditCodebaseLocally(tempDir, repoName) {
  const { fileTree, configs } = analyzeCodebase(tempDir);

  let hasGitIgnore = false;
  let committedSecrets = [];
  let monolithicFiles = [];
  let testFilesCount = 0;
  let totalSourceFiles = 0;
  let maxNestingDepth = 0;
  let largeMediaFiles = [];
  let readmeContent = '';
  let usedHeavyLibs = [];

  // Parse gitignore presence
  hasGitIgnore = fileTree.some(f => f.path === '.gitignore');

  // Read README content if found
  const readmeFile = fileTree.find(f => f.path.toLowerCase() === 'readme.md');
  if (readmeFile) {
    try {
      readmeContent = fs.readFileSync(path.join(tempDir, readmeFile.path), 'utf8');
    } catch (_) {}
  }

  // Parse package dependencies
  const packageJson = fileTree.find(f => f.path.endsWith('package.json'));
  if (packageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, packageJson.path), 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps['moment']) usedHeavyLibs.push('moment');
      if (deps['lodash'] && !deps['lodash-es']) usedHeavyLibs.push('lodash');
      if (deps['jquery']) usedHeavyLibs.push('jquery');
    } catch (_) {}
  }

  // Audit files
  fileTree.forEach(file => {
    if (file.type !== 'blob') return;
    const filePath = file.path;
    const lowerPath = filePath.toLowerCase();
    const size = file.size;

    // Track depth
    const depth = filePath.split('/').length;
    if (depth > maxNestingDepth) maxNestingDepth = depth;

    // Secret scans
    if (
      lowerPath.endsWith('.env') || 
      lowerPath.endsWith('.env.local') || 
      lowerPath.includes('secret') && lowerPath.endsWith('.json') ||
      lowerPath.endsWith('credentials.json')
    ) {
      committedSecrets.push(filePath);
    }

    // Test scans
    if (
      lowerPath.includes('test') || 
      lowerPath.includes('spec') || 
      lowerPath.includes('__tests__')
    ) {
      if (
        lowerPath.endsWith('.js') || 
        lowerPath.endsWith('.jsx') || 
        lowerPath.endsWith('.ts') || 
        lowerPath.endsWith('.tsx') || 
        lowerPath.endsWith('.py') || 
        lowerPath.endsWith('.go')
      ) {
        testFilesCount++;
      }
    }

    // Source files & Monolith scans
    if (
      lowerPath.endsWith('.js') || 
      lowerPath.endsWith('.jsx') || 
      lowerPath.endsWith('.ts') || 
      lowerPath.endsWith('.tsx') || 
      lowerPath.endsWith('.py') || 
      lowerPath.endsWith('.go') || 
      lowerPath.endsWith('.java') || 
      lowerPath.endsWith('.css')
    ) {
      totalSourceFiles++;
      if (size > 40000) {
        monolithicFiles.push({ path: filePath, size });
      }
    }

    // Media scans
    if (
      (lowerPath.endsWith('.png') || 
       lowerPath.endsWith('.jpg') || 
       lowerPath.endsWith('.jpeg') || 
       lowerPath.endsWith('.mp4')) && 
      size > 1500000
    ) {
      largeMediaFiles.push({ path: filePath, size });
    }
  });

  // Calculate scores
  let scoreSec = 100;
  let scoreArch = 100;
  let scoreDx = 100;
  let scorePerf = 100;
  let scoreUx = 100;

  if (committedSecrets.length > 0) scoreSec -= 45;
  if (!hasGitIgnore) scoreSec -= 20;
  scoreSec = Math.max(30, scoreSec);

  scoreArch -= (monolithicFiles.length * 12);
  if (maxNestingDepth > 6) scoreArch -= 10;
  if (totalSourceFiles < 4) scoreArch -= 15;
  scoreArch = Math.max(35, scoreArch);

  if (testFilesCount === 0) scoreDx -= 30;
  else if (testFilesCount / totalSourceFiles < 0.05) scoreDx -= 15;
  if (!readmeFile) scoreDx -= 25;
  else if (readmeContent.length < 400) scoreDx -= 10;
  scoreDx = Math.max(40, scoreDx);

  if (usedHeavyLibs.includes('moment')) scorePerf -= 15;
  if (usedHeavyLibs.includes('lodash')) scorePerf -= 10;
  scorePerf -= (largeMediaFiles.length * 15);
  scorePerf = Math.max(45, scorePerf);

  const hasFrontEnd = fileTree.some(f => {
    const p = f.path.toLowerCase();
    return p.includes('components') || p.includes('views') || p.endsWith('.jsx') || p.endsWith('.tsx') || p.endsWith('.css');
  });
  if (hasFrontEnd) {
    const hasLoadingFeedback = fileTree.some(f => {
      const p = f.path.toLowerCase();
      return p.includes('skeleton') || p.includes('loading') || p.includes('spinner') || p.includes('fallback');
    });
    if (!hasLoadingFeedback) scoreUx -= 25;
  } else {
    scoreUx = 90;
  }
  scoreUx = Math.max(50, scoreUx);

  const overall = Math.round(
    (scoreArch * 0.25) + 
    (scoreUx * 0.20) + 
    (scoreSec * 0.20) + 
    (scorePerf * 0.20) + 
    (scoreDx * 0.15)
  );

  const scores = { overall, arch: scoreArch, ux: scoreUx, perf: scorePerf, sec: scoreSec, dx: scoreDx };

  // Compile local debate
  const debate = [];
  if (committedSecrets.length > 0) {
    debate.push({
      sender: "Security Agent",
      message: `LOCAL AUDIT: Sensitive configurations committed directly: [${committedSecrets.join(', ')}]. Highly insecure.`,
      avatar: "🛡️"
    });
  } else {
    debate.push({ sender: "Security Agent", message: "LOCAL AUDIT: No environment secrets found committed directly. Good.", avatar: "🛡️" });
  }

  if (monolithicFiles.length > 0) {
    debate.push({
      sender: "Architecture Agent",
      message: `LOCAL AUDIT: Found ${monolithicFiles.length} files over recommended sizes (>40KB). I suggest modularization.`,
      avatar: "🏛️"
    });
  } else {
    debate.push({ sender: "Architecture Agent", message: "LOCAL AUDIT: Folder structures and module sizes are healthy.", avatar: "🏛️" });
  }

  if (testFilesCount === 0) {
    debate.push({
      sender: "Recruiter Agent",
      message: "LOCAL AUDIT: I don't see any unit tests configured. Add Jest or standard asserts to impress hiring managers.",
      avatar: "💼"
    });
  } else {
    debate.push({ sender: "Recruiter Agent", message: `LOCAL AUDIT: Found ${testFilesCount} test file patterns. Nice job.`, avatar: "💼" });
  }

  // Compile playbook tickets
  const playbook = [];
  let ticketId = 1;

  if (committedSecrets.length > 0) {
    playbook.push({
      id: ticketId++,
      severity: "critical",
      agent: "Security",
      agentIcon: "🛡️",
      title: "Committed Environment Credentials Committed to Source Control",
      desc: "Secrets were detected directly in the git tree. Remove these files immediately and revoke any keys.",
      file: committedSecrets[0],
      diff: `@@ -1,3 +1,4 @@
-# Leaked Credentials File
-JWT_SECRET_KEY=mySuperLeakedSecretValue123!
-DATABASE_URL=postgres://user:password@localhost:5432/db
+# MOVED TO ENV VARS
+JWT_SECRET_KEY=process.env.JWT_SECRET_KEY
+DATABASE_URL=process.env.DATABASE_URL`
    });
  }

  if (!hasGitIgnore) {
    playbook.push({
      id: ticketId++,
      severity: "warning",
      agent: "Security",
      agentIcon: "🛡️",
      title: "Missing Git Ignore Specification (.gitignore)",
      desc: "No .gitignore manifest exists in the repository root. Add standard ignore files.",
      file: ".gitignore",
      diff: `@@ -0,0 +1,5 @@
+node_modules/
+.env
+.env.local
+dist/
+build/`
    });
  }

  if (monolithicFiles.length > 0) {
    playbook.push({
      id: ticketId++,
      severity: "warning",
      agent: "Architecture",
      agentIcon: "🏛️",
      title: "Monolithic Source File Exceeds Size Guidelines",
      desc: "The file is unusually large, indicating it holds multiple responsibilities. Refactor this block.",
      file: monolithicFiles[0].path,
      diff: `@@ -1,200 +1,5 @@
-// Monolithic Component
-export function MonolithicComponent() { ... }
-
+// REFACTORED TO INDEPENDENT MODULES
+import { MonolithicComponent } from './components/MonolithicComponent';`
    });
  }

  if (testFilesCount === 0) {
    playbook.push({
      id: ticketId++,
      severity: "critical",
      agent: "DX & Docs",
      agentIcon: "📚",
      title: "No Test Harness Configured in Repository",
      desc: "We searched the entire file list and did not identify a test suite. Configure Jest or pytest.",
      file: "package.json",
      diff: `@@ -8,3 +8,3 @@
   "scripts": {
-    "test": "echo \\"Error: no test specified\\" && exit 1"
+    "test": "jest --passWithNoTests"
   }`
    });
  }

  if (playbook.length === 0) {
    playbook.push({
      id: ticketId++,
      severity: "info",
      agent: "DX & Docs",
      agentIcon: "📚",
      title: "Local static audit check clean",
      desc: "Static analyzer completed with no critical warnings.",
      file: "README.md",
      diff: `@@ -1,2 +1,2 @@
 # Project
-Active Dev.
+Active Dev & Verified Clean.`
    });
  }

  // Compile QA
  const qa = {
    "Would this impress recruiters?": testFilesCount > 0 
      ? `Yes, the repository includes test configurations.`
      : `Currently, no. The complete absence of test files is a warning flag for recruiters looking for production experience.`,
    "What features or states are missing?": "You should add error boundary handlers and explicit loading states on pages performing fetching functions.",
    "What technical debt should I fix first?": committedSecrets.length > 0
      ? `Fix the committed environment variables [${committedSecrets[0]}] immediately!`
      : `Begin writing unit test configurations to verify your primary business flows.`,
    "How scalable is this architecture?": "The folder layout is flat. As you expand, map separate modular files to prevent logic leaks."
  };

  return { repoName, scores, debate, playbook, qa, fileTree };
}

module.exports = { 
  analyzeCodebase,
  auditCodebaseLocally
};
