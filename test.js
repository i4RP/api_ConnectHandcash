// Expressモジュールのインポート
import express from 'express';

// Expressアプリケーションの初期化
const app = express();

// ルートURLへのGETリクエストに対するハンドラの設定
app.get('/', (req, res) => {
    res.send('Hello, world! This is a simple Express app.');
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
