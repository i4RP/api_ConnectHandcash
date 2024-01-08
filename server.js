const express = require('express');
const crypto = require('crypto');
const ecdsa = require('elliptic').ec;
const secp256k1 = new ecdsa('secp256k1');
const app = express();
app.use(express.json());

function createSignature(method, endpoint, body, timestamp, privateKey) {
    const serializedBody = JSON.stringify(body);
    const signaturePayload = `${method}\n${endpoint}\n${timestamp}\n${serializedBody}`;
    const sha256Hash = crypto.createHash('sha256').update(signaturePayload).digest();
    const signature = secp256k1.keyFromPrivate(privateKey).sign(sha256Hash);
    return signature.toDER('hex');
}

function generatePublicKey(privateKey) {
    const keyPair = secp256k1.keyFromPrivate(privateKey);
    return keyPair.getPublic('hex');
}


app.post('/generate-data', (req, res) => {
    const { email, privateKey } = req.body;
    const method = 'POST';
    const endpoint = 'https://cloud.handcash.io/v1/connect/account/requestEmailCode';
    const body = { email };
    const timestamp = new Date().toISOString();
    const publicKey = generatePublicKey(privateKey);
    const signature = createSignature(method, endpoint, body, timestamp, privateKey);
    res.json({ signature, timestamp, publicKey });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
