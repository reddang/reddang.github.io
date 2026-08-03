# REDDANG Portfolio

Welcome to the **REDDANG Portfolio** website. This is a static portfolio website highlighting work across Product Design, Business & Strategy, 3D & Visualization, and Graphic Design.

Since this website fetches pages dynamically (`projects.json` and `components.html`), opening `index.html` directly in your browser (`file://` protocol) will fail due to browser security restrictions (CORS). You must host it using a local server.

---

## 🚀 How to Run on Another Computer

Here are the simplest methods to run this website locally on any machine.

### Method 1: Using Node.js & NPM (Recommended)
This method is recommended as it has hot-reloading (the browser refreshes automatically when you save changes).

1. **Install Node.js**: Make sure you have [Node.js](https://nodejs.org/) installed.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
   The site will automatically open in your default browser at `http://127.0.0.1:8080`.

---

### Method 2: Using Python
If you already have Python installed, you don't need to install Node.js.

1. Open your terminal/command prompt in this folder.
2. Run one of the following commands depending on your Python version:
   - **Python 3.x**:
     ```bash
     python -m http.server 8000
     ```
   - **Python 2.x**:
     ```bash
     python -m SimpleHTTPServer 8000
     ```
3. Open your browser and navigate to `http://localhost:8000`.

---

### Method 3: Using VS Code "Live Server" Extension
If you use Visual Studio Code:

1. Open this repository folder in VS Code.
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for **Live Server** (by Ritwick Dey) and click **Install**.
4. Click the **Go Live** button in the status bar at the bottom-right corner of VS Code.

---

### Method 4: Using Docker
If you prefer running inside a Docker container:

```bash
# Windows (PowerShell)
docker run -it --rm -p 8080:80 -v ${PWD}:/usr/share/nginx/html nginx:alpine

# macOS/Linux/Git Bash
docker run -it --rm -p 8080:80 -v $(pwd):/usr/share/nginx/html nginx:alpine
```
Then navigate to `http://localhost:8080`.

---

## 📁 Project Structure

- `index.html` - The home page of the portfolio.
- `project-detail.html` - Dynamic project detail view page.
- `components.html` - Contains shared layout templates (header and footer).
- `projects.json` - JSON file housing all portfolio items, descriptions, and media links.
- `script.js` - Application logic including data rendering, filters, and dynamic layout injection.
- `style.css` - Custom styling rules.
- `assets/` - Images, vectors, and other static assets.

---

## 🌐 Deploying to GitHub Pages

Since this repository is named `reddang.github.io`, it is configured to host directly on GitHub Pages!

To publish changes:
1. Commit and push your changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Update portfolio content"
   git push origin main
   ```
2. Your changes will automatically build and publish to `https://reddang.github.io` within a few minutes.
