Camera Zoom App
一個使用 React + TypeScript (或 JavaScript) 建立的範例專案，示範了：

如何向瀏覽器請求存取相機（前/後鏡頭）。
透過硬體光學變焦（若裝置支援）或 CSS transform 進行縮放。
支援滑鼠按鈕與雙指觸控手勢 (pinch) 來調整縮放。
針對常見相機錯誤（權限拒絕、裝置不存在、被占用等）給予使用者提示並提供重試。
功能特點
環境 / 前置鏡頭切換：支援在行動裝置或支援多鏡頭的裝置上切換鏡頭。
光學 / 數位變焦：若瀏覽器裝置支援 getCapabilities().zoom，則會使用 applyConstraints({ zoom })；否則會退回使用 CSS transform: scale() 方式達成數位變焦。
Pinch to Zoom：在觸控裝置上，透過雙指手勢動態調整縮放倍數。
錯誤處理：對於未授權、無裝置、裝置被占用、等不同錯誤類型顯示對應訊息，並提供「重試」按鈕。
專案結構
plaintext
複製
.
├── public
│   └── index.html
├── src
│   ├── App.tsx          # 主功能元件
│   ├── index.tsx        # React 進入點
│   └── ...other files...
├── package.json
└── README.md
App.tsx：包含了所有相機操作（存取/切換/變焦）與 UI 呈現的主要邏輯。
index.tsx：應用程式進入點 (ReactDOM.render / createRoot 等)。
其他設定檔如 .eslintrc.js, tsconfig.json 或 tailwind.config.js 等，依實際使用的技術而定。
環境需求
Node.js 14+ (或更高版本)
一個支援 ES6 的現代瀏覽器（最佳在 Chrome / Safari / Firefox / Edge 近期版本）
若要進行行動裝置測試，需要有可用的前/後相機（多鏡頭）或使用手機模擬器 / 實機測試
安裝與使用
下載 / clone 專案：

bash
複製
git clone https://github.com/your-repo/camera-zoom-app.git
cd camera-zoom-app
安裝相依套件：

bash
複製
npm install
# 或使用 yarn
yarn
啟動開發伺服器：

bash
複製
npm start
# 或使用 yarn
yarn start
在瀏覽器開啟：

開啟瀏覽器，進入 http://localhost:3000 (依實際設定為準)。
首次啟動時，瀏覽器會詢問是否允許使用相機，請點選「允許」。
使用說明
進入主畫面後，若裝置支援相機，會自動嘗試存取相機。
當相機成功啟動，你可以：
點擊「+」或「-」按鈕 進行數位/光學變焦。
雙指手勢 (Pinch) 以放大或縮小影像（手機裝置或觸控螢幕）。
點擊「翻轉鏡頭」按鈕 切換前鏡頭 / 後鏡頭（若支援多鏡頭）。
若相機拒絕存取或裝置不支援，畫面會顯示錯誤訊息，可透過「重試」按鈕再次嘗試。
主要程式碼說明
相機存取 (navigator.mediaDevices.getUserMedia)
使用 facingMode 參數指定要使用前鏡頭(user)或後鏡頭(environment)。
ts
複製
const constraints = {
  video: {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
};
const stream = await navigator.mediaDevices.getUserMedia(constraints);
光學變焦 / 數位變焦
先透過 videoTrack.getCapabilities().zoom 檢查裝置是否支援硬體光學變焦。
若支援：呼叫 videoTrack.applyConstraints({ advanced: [{ zoom: ... }] })
若不支援或失敗：使用 <video style="transform: scale(...)" /> 模擬數位縮放。
Pinch to Zoom
監聽 touchstart, touchmove, touchend 事件，計算雙指間距變化比率，動態更新縮放倍數。
錯誤處理
依照不同錯誤類型（NotAllowedError, NotFoundError, NotReadableError 等）顯示提示訊息，協助使用者排除權限設定或相機裝置問題。
常見問題
為什麼在 iOS Safari 上無法切換後鏡頭？

某些 iOS 版本可能對 facingMode: { exact: "environment" } 或者 user/environment 的支援不完善。需要在不同裝置/OS 版本上測試，或改用 deviceId 方式針對特定鏡頭。
在某些瀏覽器上無法使用光學變焦

並非所有裝置都支援 getCapabilities().zoom，特別是較舊的 Android 手機或桌面瀏覽器。可以在 console 中檢查 capabilities。
畫面放大後有被裁切？

如果使用了 .object-cover 或其他 CSS 屬性，可能導致視訊被裁切。可依需求調整 CSS 或讓視訊保持完整顯示。
相機權限被拒絕後要如何再開啟？

若使用者在瀏覽器彈出對話窗時選擇「拒絕」，之後需要到瀏覽器設定或隱私權管理頁面中手動允許相機權限，才能再次使用。
授權
此範例程式碼僅供學習與參考使用，如有需要可自行於專案中整合。若有任何延伸需求或商业用途，請參照原套件 / 函式庫的授權條款，或與作者聯絡。

