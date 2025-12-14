# 📤 GitHub Upload Guide - InstaGen

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com/new)
2. Click **"New"** button (top right)
3. Fill in the form:
   - **Repository name**: `InstaGen`
   - **Description**: `Fabric.js Canvas Editor with Dark Mode & Social Safe Zones`
   - **Visibility**: Choose `Public` or `Private`
   - ✅ **Check**: "Add a README file"
   - ✅ **Check**: "Add .gitignore" (select Python and Node)
4. Click **"Create repository"**
5. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/InstaGen.git`)

---

## Step 2: Open Terminal & Navigate to Project

### Windows PowerShell / CMD
```powershell
cd c:\Users\sansk\OneDrive\Desktop\InstaGen
```

### Git Bash
```bash
cd /c/Users/sansk/OneDrive/Desktop/InstaGen
```

---

## Step 3: Initialize Git & Upload

Run these commands **one by one** in your terminal:

### 3.1 Initialize Git
```powershell
git init
```

### 3.2 Add all files to staging area
```powershell
git add .
```

### 3.3 Create initial commit
```powershell
git commit -m "Initial commit: Fabric.js Canvas Editor with Dark Mode & Social Safe Zones"
```

### 3.4 Link to your GitHub repository
```powershell
git remote add origin https://github.com/YOUR_USERNAME/InstaGen.git
```

**⚠️ Replace `YOUR_USERNAME` with your actual GitHub username!**

### 3.5 Push to GitHub
```powershell
git push -u origin master
```

If you get an error about `master` branch, try:
```powershell
git branch -M main
git push -u origin main
```

---

## Step 4: Verify Upload

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/InstaGen`
2. Check if all files are there
3. Verify the `.gitignore` is present
4. You should see:
   - ✅ `frontend/` folder
   - ✅ `backend/` folder (if you have it)
   - ✅ `SOURCE_CODE_COMPLETE.md`
   - ✅ `.gitignore`
   - ✅ `README.md`

---

## Complete Terminal Commands (Copy & Paste)

If you want to run all commands at once, open PowerShell and paste:

```powershell
cd c:\Users\sansk\OneDrive\Desktop\InstaGen
git init
git add .
git commit -m "Initial commit: Fabric.js Canvas Editor with Dark Mode & Social Safe Zones"
git remote add origin https://github.com/YOUR_USERNAME/InstaGen.git
git push -u origin master
```

**Remember to replace `YOUR_USERNAME`!**

---

## What Gets Uploaded?

### ✅ UPLOADED TO GITHUB
- Frontend source code (`.jsx`, `.js`, `.css`)
- Backend code (if applicable)
- Configuration files (`vite.config.js`, `tailwind.config.js`, `package.json`)
- Documentation files (`.md`)
- `.gitignore` (already created for you)

### ❌ NOT UPLOADED (Ignored by .gitignore)
- `frontend/node_modules/` (240MB+)
- `backend/venv/` or `.venv/` (Python dependencies)
- `.env` files (secret keys)
- Build outputs (`dist/`, `build/`)
- IDE settings (`.vscode/`, `.idea/`)

---

## For People Who Clone Your Project

After someone downloads your code, they'll run:

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### Backend Setup (if applicable)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## Troubleshooting

### ❌ Error: "fatal: not a git repository"
**Fix**: Make sure you're in the correct folder:
```powershell
cd c:\Users\sansk\OneDrive\Desktop\InstaGen
git status  # Should show git is initialized
```

### ❌ Error: "fatal: Permission denied"
**Fix**: Configure Git with your GitHub credentials:
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### ❌ Error: "fatal: The remote origin already exists"
**Fix**: Remove the old remote and add the correct one:
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/InstaGen.git
```

### ❌ Error: "fatal: 'master' branch not found"
**Fix**: Use `main` instead (modern GitHub default):
```powershell
git branch -M main
git push -u origin main
```

### ⚠️ Large Files Warning
If you get an error about files being too large:
1. Check the `.gitignore` file is properly configured
2. Delete any `node_modules` folders before committing
3. Delete any `venv`/`.venv` folders before committing
4. Run `git add .` again

---

## Next Steps After Upload

### 1. Create a Professional README.md
Add to the root of your GitHub repo:

```markdown
# InstaGen 🎨

Fabric.js Canvas Editor with Dark Mode & Social Safe Zones

## Features
- ✨ Fabric.js Canvas with text, shapes, and drawing tools
- 🌓 Dark mode support with localStorage persistence
- 📱 Social safe zones (9x16 compliance)
- 📥 Export to PNG/JPG at multiple resolutions
- ⚡ Built with React 18 + Vite 5

## Quick Start
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Tech Stack
- Frontend: React 18.2.0, Vite 5.0, Fabric.js 5.3.0, Tailwind CSS 3.3.6
- Backend: (Python/Node.js - add your tech)

## License
MIT
```

### 2. Add Topics to GitHub
On your repo page → Settings → Topics:
- `fabric-js`
- `canvas-editor`
- `dark-mode`
- `react`
- `vite`

### 3. Star ⭐ Important Libraries
If you use their libraries, give them a star on GitHub!

---

## File Size Summary

**Expected GitHub Repository Size**: ~3-5MB (after .gitignore)

| Folder | Size | Uploaded? |
|--------|------|-----------|
| `frontend/node_modules/` | 800MB+ | ❌ No |
| `backend/venv/` | 500MB+ | ❌ No |
| `frontend/src/` | ~500KB | ✅ Yes |
| `backend/app/` | ~1MB | ✅ Yes (if applicable) |
| Documentation | ~2MB | ✅ Yes |

---

## Questions?

If you have issues:
1. Check that `.gitignore` exists in the root folder
2. Run `git status` to see what files are staged
3. Verify your GitHub URL is correct
4. Make sure you replaced `YOUR_USERNAME` in the git remote command

---

**Happy coding! 🚀**

Generated: December 15, 2025
