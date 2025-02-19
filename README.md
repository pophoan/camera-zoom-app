請使用手機登錄以網址測試
https://pophoan.github.io/camera-zoom-app/

# Camera Zoom App

一個使用 **React** + **TypeScript** (或 JavaScript) 建立的範例專案，示範了：

- 如何向瀏覽器請求存取相機（前/後鏡頭）。
- 透過硬體光學變焦（若裝置支援）或 CSS `transform` 進行縮放。
- 支援滑鼠按鈕與雙指觸控手勢 (pinch) 來調整縮放。
- 針對常見相機錯誤（權限拒絕、裝置不存在、被占用等）給予使用者提示並提供重試。

---

## 功能特點

- **環境 / 前置鏡頭切換**  
  支援在行動裝置或多鏡頭裝置上切換鏡頭。

- **光學 / 數位變焦**  
  若瀏覽器裝置支援 `getCapabilities().zoom`，則會使用  
  `applyConstraints({ zoom })`；否則退回使用 CSS `transform: scale()`  
  方式達成數位變焦。

- **Pinch to Zoom**  
  在觸控裝置上，透過雙指手勢動態調整縮放倍數。

- **錯誤處理**  
  對於未授權、無裝置、裝置被占用等錯誤情況，顯示對應提示，並提供「重試」按鈕。

---

## 專案結構

```plaintext
.
├── public
│   └── index.html
├── src
│   ├── App.tsx          # 主功能元件，包含相機操作（存取 / 切換 / 變焦）與 UI 邏輯
│   ├── index.tsx        # React 進入點 (ReactDOM.render / createRoot)
│   └── ...other files...
├── package.json
└── README.md
