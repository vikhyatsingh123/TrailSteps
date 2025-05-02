# 🚀 TrailSteps - Chrome Extension

**TrailSteps** is a Chrome Extension that captures every interaction you perform on a website, turns them into editable steps in a sidebar panel, and lets you export them as a structured PDF.  
Think of it as a lightweight, open-source alternative to [Tango](https://app.tango.us).

---

## 🧠 Features

- 📌 Tracks all clicks and interactions across any website
- 📝 Displays recorded steps in a clean sidebar UI (built with React + AntD)
- 🧹 Edit, delete, or reorder steps before export
- 📄 Submit to open a new PDF generation page
- 🖨️ Download your step-by-step guide as a PDF

---

## 🛠️ Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Ant Design](https://ant.design/)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- PDF Export using `html2canvas` + `jsPDF` or `html2pdf.js`

---

## 📁 Project Structure

```text
trailsteps/
├── public/
│   ├── pdf.html            # HTML entry for PDF React page
│   └── icons/              # Extension icons
├── src/
│   ├── content/            # contentScript.ts - DOM tracking logic
│   ├── background/         # background.ts - event routing & tab handling
│   ├── sidepanel/          # React sidebar UI (Vite + AntD + Tailwind)
│   ├── pdfview/            # React PDF view page for export
│   └── manifest.json       # Chrome extension configuration
├── vite.config.ts
└── README.md
```
