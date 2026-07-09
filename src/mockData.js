export const mockProjects = {
  "react-saas-portfolio": {
    repoName: "github.com/johndoe/react-saas-portfolio",
    scores: { overall: 76, arch: 82, ux: 61, perf: 84, sec: 80, dx: 73 },
    debate: [
      { sender: "System", message: "Cloning repository 'https://github.com/johndoe/react-saas-portfolio'...", avatar: "⚙️" },
      { sender: "System", message: "Parsing React elements and AST dependencies...", avatar: "⚙️" },
      { sender: "UX Agent", message: "I'm checking the UI flow. There are no Loading boundaries in src/pages/Dashboard.jsx while user widgets are fetched. This leads to layout shifts.", avatar: "🎨" },
      { sender: "Architecture Agent", message: "Agreed. Furthermore, the dashboard hooks are directly fetching data from the API endpoint without a service abstraction layer.", avatar: "🏛️" },
      { sender: "Performance Agent", message: "Wait, the dashboard also fetches the entire user list just to show the user avatar count. That's a classic overfetching issue. 2.1MB bundle size detected.", avatar: "⚡" },
      { sender: "Security Agent", message: "I scanned the dependencies. package.json holds two outdated libraries vulnerable to prototype pollution. Safe to upgrade, no breaking APIs.", avatar: "🛡️" },
      { sender: "Recruiter Agent", message: "This repository has clean folder layouts, but there are absolutely zero unit tests configured. Hiring managers will notice that instantly.", avatar: "💼" },
      { sender: "System", message: "Consensus resolved. Audit compiled successfully.", avatar: "⚙️" }
    ],
    playbook: [
      {
        id: 1,
        severity: "critical",
        agent: "Product & UX",
        agentIcon: "🎨",
        title: "Missing Loading/Fallback Boundaries in Dashboard View",
        desc: "The Dashboard page loads multiple asynchronous cards concurrently. Without suspense boundaries or skeleton states, the UI experiences sudden layout shifts (CLS), violating standard design guides.",
        file: "src/pages/Dashboard.jsx",
        diff: `@@ -12,4 +12,12 @@
 function Dashboard() {
   const { data, loading } = useDashboardState();
 
-  return <div class="grid">{data.map(item => <Card data={item} />)}</div>;
+  if (loading) {
+    return (
+      <div class="grid skeleton-loader">
+        <SkeletonCard />
+        <SkeletonCard />
+      </div>
+    );
+  }
+  return <div class="grid">{data.map(item => <Card data={item} />)}</div>;`
      },
      {
        id: 2,
        severity: "warning",
        agent: "Architecture",
        agentIcon: "🏛️",
        title: "Missing Service Layer Abstraction for API Fetches",
        desc: "API calls are written directly within UI hooks. Changing api endpoint schemas will force you to update multiple component files instead of a single gateway.",
        file: "src/hooks/useDashboardState.js",
        diff: `@@ -5,3 +5,7 @@
 export function useDashboardState() {
   useEffect(() => {
-    fetch('https://api.myproject.com/v1/user')
+    apiClient.get('/user')
       .then(res => res.json())
-      .then(d => setData(d))
+      .then(d => setData(d.users))
   }, []);`
      },
      {
        id: 3,
        severity: "info",
        agent: "DX & Docs",
        agentIcon: "📚",
        title: "Incomplete Local Onboarding Script",
        desc: "The README outlines dependencies but does not automate local developer setup. Adding a standard initialization script speeds up new contributor setup.",
        file: "README.md",
        diff: `@@ -1,3 +1,6 @@
 # SaaS Portfolio React
 
-Install dependencies with npm install.
+## Local Setup
+Clone the project and run:
+\`\`\`bash
+./scripts/setup.sh
+\`\`\``
      }
    ],
    qa: {
      "Would this impress recruiters?": "The codebase has clear formatting and a neat directory layout. However, the complete absence of unit tests or CI workflows makes it look like a hobby project. To impress recruiters, add at least 5 unit tests for your business hooks and set up a basic GitHub Actions workflow.",
      "What features or states are missing?": "You are missing explicit error fallback states. If the dashboard API returns a 500 error, the application will crash. Introduce React Error Boundaries around the dashboard layout, and use visual skeleton states instead of plain text loaders.",
      "What technical debt should I fix first?": "Start by abstracting the fetch calls. Moving API calls out of React hooks and into a dedicated client service module makes your code easier to maintain and test.",
      "How scalable is this architecture?": "As you add features, you will struggle to test states because the logic is tightly bound to visual components. While it works fine for single-developer products, standardizing state containers is essential for larger teams."
    }
  },
  "express-node-microservice": {
    repoName: "github.com/devteam/express-node-microservice",
    scores: { overall: 68, arch: 55, ux: 90, perf: 72, sec: 48, dx: 75 },
    debate: [
      { sender: "System", message: "Fetching codebase configurations...", avatar: "⚙️" },
      { sender: "Security Agent", message: "Critical risk: Session token key is hardcoded directly inside config/keys.js instead of loaded via environment variables.", avatar: "🛡️" },
      { sender: "Architecture Agent", message: "Yes, and controllers/authController.js references dbHelper.js, which recursively calls the auth helper, forming circular dependency cycles.", avatar: "🏛️" },
      { sender: "Performance Agent", message: "Database connection pools are not limited. Under load, this service will run out of database sockets and drop active connections.", avatar: "⚡" },
      { sender: "UX Agent", message: "The API responses are beautifully structured, though. Error schemas follow clean REST guidelines with proper statuses.", avatar: "🎨" },
      { sender: "System", message: "Audit complete. Vulnerabilities found.", avatar: "⚙️" }
    ],
    playbook: [
      {
        id: 1,
        severity: "critical",
        agent: "Security",
        agentIcon: "🛡️",
        title: "Hardcoded Session Sign Key in Config",
        desc: "Session signing secrets are hardcoded in the codebase. If this code is pushed to a public repository, token authentication can be forged easily.",
        file: "config/keys.js",
        diff: `@@ -1,4 +1,4 @@
 module.exports = {
-  secretOrKey: "mySuperSecretPassword123!"
+  secretOrKey: process.env.JWT_SECRET_KEY
 };`
       },
       {
         id: 2,
         severity: "critical",
         agent: "Architecture",
         agentIcon: "🏛️",
         title: "Circular Dependencies in Controller Loops",
         desc: "Circular module reference loops between controllers and helpers. This degrades runtime startup times and creates complex mock environments during testing.",
         file: "controllers/authController.js",
         diff: `@@ -2,4 +2,3 @@
 const db = require('../helpers/dbHelper');
-const auth = require('../helpers/authHelper'); // Cycle trigger
+const authPolicy = require('../config/authPolicy');`
       }
     ],
     qa: {
       "Would this impress recruiters?": "Hiring managers reviewing backend developers look for security and testing. Hardcoded secrets are a red flag that suggests a lack of production experience. Fixing this instantly elevates your portfolio.",
       "What features or states are missing?": "You need proper database seed scripts. Currently, a new developer has no easy way to load mock users or mock relational data to run the API locally.",
       "What technical debt should I fix first?": "Fix the hardcoded secret immediately. Move it to a dotenv file and add `.env.example` to the repository root.",
       "How scalable is this architecture?": "The circular dependency loops make writing unit tests very difficult. Refactoring these loops is necessary to expand this service to support more endpoints."
     }
  },
  "django-ecommerce": {
    repoName: "github.com/startup-lab/django-ecommerce",
    scores: { overall: 81, arch: 85, ux: 82, perf: 65, sec: 88, dx: 85 },
    debate: [
      { sender: "System", message: "Analyzing project framework: Django 4.x...", avatar: "⚙️" },
      { sender: "Performance Agent", message: "The product list catalog view runs a nested loop over categories, creating N+1 query loops. We need standard prefetch_related optimizations.", avatar: "⚡" },
      { sender: "Architecture Agent", message: "The app boundary structure is solid. Models are isolated from templates nicely.", avatar: "🏛️" },
      { sender: "Security Agent", message: "CSRF token protection is enabled globally, but check out views/checkout.py. It has a csrf_exempt decorator on payment webhooks.", avatar: "🛡️" },
      { sender: "System", message: "Consensus established.", avatar: "⚙️" }
    ],
    playbook: [
      {
        id: 1,
        severity: "critical",
        agent: "Performance",
        agentIcon: "⚡",
        title: "N+1 Queries in Main Product Feed",
        desc: "Loading the main products listings executes a database fetch query for each product's parent categories. 100 products triggers 100 database hits.",
        file: "store/views.py",
        diff: `@@ -4,4 +4,4 @@
 def product_list(request):
-    products = Product.objects.all()
+    products = Product.objects.select_related('category').all()
     return render(request, 'store/list.html', {'products': products})`
       }
     ],
     qa: {
       "Would this impress recruiters?": "Yes. The modular architecture is clean, and the folder layout is professional. Fixing the performance issue shows you understand advanced ORM queries.",
       "What features or states are missing?": "The payment webhook lacks raw signature validation. Verify payment provider signatures to ensure users can't forge fake orders.",
       "What technical debt should I fix first?": "Optimize the database query loops using select_related/prefetch_related to speed up page loads.",
       "How scalable is this architecture?": "Django's monolithic structure works well here. However, under high load, you should move products search to a dedicated query search index (e.g. Postgres Full Text Search or Elasticsearch)."
     }
  }
};

export function generateDynamicProject(repoName) {
  const hash = repoName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const valRange = (min, max, seed) => min + ((hash * seed) % (max - min));
  
  const overall = valRange(68, 92, 3);
  const arch = valRange(65, 94, 5);
  const ux = valRange(60, 92, 7);
  const perf = valRange(62, 95, 11);
  const sec = valRange(58, 92, 13);
  const dx = valRange(65, 93, 17);

  return {
    repoName: repoName,
    scores: { overall, arch, ux, perf, sec, dx },
    debate: [
      { sender: "System", message: `Cloning repository '${repoName}'...`, avatar: "⚙️" },
      { sender: "System", message: "Indexing codebase contents and analyzing modules...", avatar: "⚙️" },
      { sender: "Architecture Agent", message: "Folder configurations appear neat, but utility methods lack static typing or comprehensive documentation.", avatar: "🏛️" },
      { sender: "UX Agent", message: "The component layouts show minor alignment discrepancies on mobile views.", avatar: "🎨" },
      { sender: "Performance Agent", message: "Asset load paths are fine. Suggest setting up lazy route loading for heavier component pages.", avatar: "⚡" },
      { sender: "Security Agent", message: "Scanned dependencies manifests. No high severity security warning vectors found.", avatar: "🛡️" },
      { sender: "System", message: "Debates concluded. Assessment metrics compiled.", avatar: "⚙️" }
    ],
    playbook: [
      {
        id: 1,
        severity: "warning",
        agent: "Product & UX",
        agentIcon: "🎨",
        title: "Missing responsive padding boundaries in layout containers",
        desc: "Layout wrappers utilize rigid width definitions instead of fluid percentages, risking overflow clipping on mobile interfaces.",
        file: "src/index.css",
        diff: `@@ -10,3 +10,6 @@
 .container {
   width: 960px;
+  max-width: 100%;
+  padding: 0 16px;
 }`
      }
    ],
    qa: {
      "Would this impress recruiters?": "The codebase is a decent starting point. To make it highly impressive, configure a robust unit testing harness and set up a deployment workflow.",
      "What features or states are missing?": "You should add form loading states and fallback dialog screens when API requests fail.",
      "What technical debt should I fix first?": "Convert rigid layouts to responsive wrappers to ensure mobile devices render pages correctly.",
      "How scalable is this architecture?": "For basic microprojects, it is perfectly suited. Add code splitting as content pages expand."
    }
  };
}
