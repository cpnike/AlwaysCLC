# 透析如虎口｜整合網站 v1.0

## 已整合模組
- `index.html`：首頁
- `pages/care-guide.html`：居家照護指南
- `pages/faq.html`：FAQ
- `pages/drama.html`：AI 短劇專區
- `pages/quiz.html`：大家來找碴互動測驗
- `pages/feedback.html`：回饋與提問（等待 Google Forms embed URL）
- `data/`：FAQ、照護指南、短劇、測驗 JSON
- `assets/css/`、`assets/js/`：各模組獨立樣式與程式

首頁學習入口順序已調整為：居家照護指南 → FAQ → AI 短劇 → 互動測驗。
各模組仍保留獨立 CSS/JS，避免不同功能樣式互相污染。

## 本機預覽
在此資料夾根目錄執行：
```bash
python -m http.server 8000
```
開啟 `http://localhost:8000`。

## GitHub Pages 部署
1. 將整個資料夾內容上傳至 GitHub repository 根目錄。
2. Repository → Settings → Pages。
3. Source 選 `Deploy from a branch`，Branch 選 `main`，資料夾選 `/ (root)`。
4. 儲存後等待部署完成，使用 GitHub Pages 提供的網址開啟。

## Google 表單
目前 `pages/feedback.html` 是表單嵌入 placeholder。請依 `GOOGLE-FORM-GUIDE.md` 建立 Google Form，複製 `<>` 嵌入網址，取代頁面 placeholder 的 iframe src。

## 重要：正式公開前審核
測驗題庫與居家照護操作內容必須由腎臟科醫師及專業腹膜透析護理師逐項審核。所有尚未核定的內容不可視為正式醫療指引。回饋表單請關閉電子郵件收集並提醒使用者勿填個資或病歷資訊。
