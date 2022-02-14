const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');
const port = process.argv[2];
const nodeAddress = uuid.v1().split('-').join('');
const rp = require('request-promise');
const { request } = require('express');

const ftm = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/blockchain', function (req, res) {
    res.send(ftm);
})


app.post('/transaction', function (req, res) {
    const blockIndex = ftm.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ note: `Transaction will be added in the block ${blockIndex}.` });
})


app.get('/mine', function (req, res) {
    const lastBlock = ftm.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: ftm.pendingTransactions,
        index: lastBlock['index'] + 1
    };

    const nonce = ftm.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = ftm.hashBlock(previousBlockHash, currentBlockData, nonce);

    ftm.createNewTransaction(420, "00", nodeAddress);

    const newBlock = ftm.createNewBlock(nonce, previousBlockHash, blockHash);



    res.json({
        note: `New block mined successfully `,
        block: newBlock
    });
})

app.post('/register-and-broadcast-node', function (req, res) {

    const newNodeUrl = req.body.newNodeUrl;
    if (ftm.networkNodes.indexOf(newNodeUrl) == -1)
        ftm.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    ftm.newtworkNodes.forEach(networtNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        regNodesPromises.push(rp(requestOptions));

        Promise.all(regNodesPromises)
            .then(data => {
                const bulkRequestOptions = {
                    uri: networtNodeUrl + '/register-nodes-bulk',
                    method: 'POST',
                    body: { allNetworkNodes: [...ftm.networkNodes, ftm.currentNodeUrl] },
                    json: true
                };

                return rp(bulkRequestOptions);
            })
            .then(data => {
                res.json = {
                    note: 'New node register successfully with the network'
                };
            })
    })

});

app.post('/register-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = ftm.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = ftm.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) ftm.networkNodes.push(newNodeUrl);
    res.json = { note: 'New node register successfully' }
});

app.post('/register-nodes-bulk', function (req, res) {

});

app.listen(port, function () {
    console.log(`Listening on port ${port}...`)
});