# 英文不散 — GitHub Pages 版

611 個英文單字、KK 音標、例句、字根、發音與學習進度。這是目前網站的獨立副本，原網站不受影響。

## 發布
1. 建立公開 GitHub 儲存庫，建議命名 `english-study`。
2. 將本資料夾內的所有檔案上傳至儲存庫（不要上傳 ZIP 本身）。
3. 在 Settings → Pages，選 Deploy from a branch，分支 main，資料夾 /docs，按 Save。
4. 發布完成後使用 Pages 顯示的網址。

## 學習紀錄
紀錄存在使用的瀏覽器。先在原網站匯出備份，再在新網址匯入。兩個網址不會自動同步紀錄，也不會自動同步後續程式更新。

## 修改與重新建置
需要 Node.js 與 npm。執行 `node scripts/build-assets.cjs`，再將 dist 內容複製到 docs（保留 .nojekyll）。Pages 發布的是 docs 裡的版本。
