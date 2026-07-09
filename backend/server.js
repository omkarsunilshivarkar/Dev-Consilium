require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { cloneRepository } = require('./services/gitService');
const { analyzeCodebase } = require('./services/astAnalyzer');
const { generateAuditReport } = require('./services/llmService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main Audit Route
app.post('/api/audit', async (req, res) => {
  const { repoUrl, scope = 'all' } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: "Missing repoUrl parameter in request body." });
  }

  let cleanName = repoUrl.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "");
  if (cleanName.endsWith(".git")) cleanName = cleanName.slice(0, -4);

  console.log(`[DevConsilium] Starting audit scanner job for: ${cleanName}`);

  let tempDir = null;
  let cleanup = null;

  try {
    // 1. Clone repository to temp folder
    const cloneResult = await cloneRepository(cleanName);
    tempDir = cloneResult.tempDir;
    cleanup = cloneResult.cleanup;
    console.log(`[DevConsilium] Successfully cloned to sandbox: ${tempDir}`);

    // Verify Groq API key exists
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.trim() === '') {
      throw new Error("Missing GROQ_API_KEY environment variable in backend .env");
    }

    // 2. Perform static file-tree indexing & manifest parsing
    const { fileTree, configs } = analyzeCodebase(tempDir, scope);
    console.log(`[DevConsilium] Scanned ${fileTree.length} files. Forwarding meta context to Groq API...`);

    // 3. Coordinate LLM specialized agent deliberation directly via Groq
    const auditData = await generateAuditReport(cleanName, fileTree, configs, scope);
    console.log(`[DevConsilium] Groq audit compiled successfully for ${cleanName}`);

    // Inject System logs back to the front-end stream logically
    const subAgentDebate = (auditData.playbook || []).map(ticket => ({
      sender: ticket.agent,
      message: ticket.analysis,
      avatar: ticket.agentIcon
    }));

    const responseData = {
      ...auditData,
      debate: [
        { sender: "System", message: `Connected to repository 'https://github.com/${cleanName}'`, avatar: "⚙️" },
        { sender: "System", message: `Cloned code workspace recursively. Scanned ${fileTree.length} files.`, avatar: "⚙️" },
        ...subAgentDebate,
        { sender: "System", message: "Audit complete. Cleaned up temp workspaces.", avatar: "⚙️" }
      ]
    };

    // Enforce scope filtering on backend response scores
    if (scope && scope !== 'all') {
      const allowedScores = ['overall', scope];
      if (responseData.scores) {
        Object.keys(responseData.scores).forEach(key => {
          if (!allowedScores.includes(key)) {
            delete responseData.scores[key];
          }
        });
      }
    }

    // Return final JSON
    res.json(responseData);

  } catch (error) {
    console.error(`[DevConsilium] Error processing audit for ${cleanName}:`, error);
    res.status(500).json({ 
      error: "Analysis Engine failure", 
      details: error.message 
    });
  } finally {
    if (cleanup) {
      console.log(`[DevConsilium] Cleaning up sandbox files at ${tempDir}`);
      cleanup();
    }
  }
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` DevConsilium Backend Server online on port ${PORT} `);
  console.log(`=================================================`);
});
