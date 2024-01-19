import express from 'express';
import rateLimit from 'express-rate-limit'; // レートリミットのためのインポート
import { HandCashConnect } from '@handcash/handcash-connect';

// Initialize express and define a port
const app = express();
const PORT = process.env.PORT || 3000;

// Use bodyParser to parse application/json
app.use(express.json());

// APIレートリミットの設定
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 各IPアドレスからのリクエストは15分間に100回まで
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// すべてのリクエストに対するレートリミットの適用
app.use(apiLimiter);

// HandCash Connect configuration
const handCashConnect = new HandCashConnect({
   appId: process.env.APP_ID,
   appSecret: process.env.APP_SECRET,
});

app.get('/', (req, res) => {
    res.send('Welcome to my API!');
});


// Define a route for the POST request to send payment
app.post('/sendPayment', async (req, res) => {
    const { authToken, currencyCode, sendAmount, destination } = req.body;

    try {
        // Get account from AuthToken
        const account = handCashConnect.getAccountFromAuthToken(authToken);

        // Define payment parameters
        const paymentParameters = {
            description: "Transaction via API",
            payments: [
                { currencyCode, sendAmount, destination },
            ],
        };

        // Execute the payment
        const paymentResult = await account.wallet.pay(paymentParameters);

        // Send back the result
        res.status(200).json(paymentResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Define a route for getting user profile
app.get('/getUserProfile', async (req, res) => {
    const { authToken } = req.query;

    try {
        const account = handCashConnect.getAccountFromAuthToken(authToken);
        const { publicProfile } = await account.profile.getCurrentProfile();

        res.status(200).json(publicProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Define a route for getting spendable balance
app.get('/getSpendableBalance', async (req, res) => {
    const { authToken } = req.query;

    try {
        const account = handCashConnect.getAccountFromAuthToken(authToken);
        const spendableBalance = await account.wallet.getSpendableBalance();

        res.status(200).json({ spendableBalance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
