const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uniqueID = require("uuid");
const port = process.argv[2];
const nodeAddress = uniqueID.v1().split("-").join("");
const rp = require("request-promise");
const { request } = require("express");

const ftm = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", function (req, res) {
  res.send(ftm);
});

app.post("/transaction", function (req, res) {
  const newTransaction = req.body;
  const blockIndex = ftm.addTransactionToPendingTransactions(newTransaction);
  res.json({
    note: `The new transaction was added in the block with the index ${blockIndex}`,
  });
});

app.post("/transaction/broadcast", function (req, res) {
  const newTransaction = ftm.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  ftm.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];
  ftm.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true,
    };
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises).then((data) => {
    res.json({ note: "Transaction created and broadcast successfully" });
  });
});

app.post("/receive-new-block", function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = ftm.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastblock['index'] + 1 === newBlock['index'];

  if (correctHash && correctIndex) {
    ftm.chain.push(newBlock);
    ftm.pendingTransactions = [];
    res.json({
      note: "New block was accepted",
      newBlock: newBlock
    });
  }
  else {
    res.json({
      note: "New block rejected!",
      newBlock: newBlock
    })
  }
})

app.get("/mine", function (req, res) {
  const lastBlock = ftm.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: ftm.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  const nonce = ftm.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = ftm.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = ftm.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  ftm.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/receive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true,
    };
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then((data) => {
      const requestOptions = {
        uri: ftm.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 420,
          sender: "00dasdadasdadwawds",
          recipient: nodeAddress,
        },
        json: true,
      };
      return rp(requestOptions);
    })
    .then((data) => {
      res.json({
        note: `New block mined successfully `,
        block: newBlock,
      });
    });
});

app.post("/register-and-broadcast-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (ftm.networkNodes.indexOf(newNodeUrl) == -1) ftm.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  ftm.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };

    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
    .then((data) => {
      const bulkRequestOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: { allNetworkNodes: [...ftm.networkNodes, ftm.currentNodeUrl] },
        json: true,
      };

      return rp(bulkRequestOptions);
    })
    .then((data) => {
      res.json({ note: "New node registered with network" });
    });
});

app.post("/register-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = ftm.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = ftm.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) ftm.networkNodes.push(newNodeUrl);
  res.json({ note: "New node register successfully" });
});

app.post("/register-nodes-bulk", function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent =
      ftm.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = ftm.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
      ftm.networkNodes.push(networkNodeUrl);
  });
  res.json({ note: "Bulk of the nodes is successful" });
});

app.get("/consensus", function (req, res) {
  const requestPromises = [];
  ftm.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/blockchain",
      method: "GET",
      json: true
    }
    requestPromises.push(rp(requestOptions));
  })

  Promise.all(requestPromises)
    .then(blockchains => {
      const currentChainLength = ftm.chain.length;
      const maxChainLength = currentChainLength;
      const newLongestChain = null;
      const newPendingTransactions = null;

      blockchains.forEach(blockchain => {
        if (blockchain.chain.length > maxChainLength) {
          maxChainLength = blockchain.chain.length;
          newLongestChain = blockchain.chain;
          newPendingTransactions = blockchain.pendingTransactions;
        }
      })

      if (!newLongestChain || (newLongestChain && !ftm.chainIsValid(newLongestChain))) {
        res.json({
          note: "Chain has not been replaced with another one",
          chain: ftm.chain
        });
      }

      else if (newLongestChain && ftm.chainIsValid(newLongestChain)) {
        ftm.chain = newLongestChain;
        ftm.pendingTransactions = newPendingTransactions;
        res.json({
          note: "Chain has been replaced with another chain which has a long lenght, so more proof of work has been done",
          chain: ftm.chain
        });
      }
    })
});

app.get('/block/:blockHash', function (req, res) {
  const blockHash = req.params.blockHash;
  const correctBlock = ftm.getBlock(blockHash);
  res.json({
    block: correctBlock
  });
});


app.get('/transaction/:transactionID', function (req, res) {
  const transactionID = req.params.transactionID;
  const transactionData = ftm.getTransaction(transactionID);
  res.json({
    transaction: transactionData.transaction,
    block: transactionData.block
  })
});


app.get('/address/:address', function (req, res) {
  const address = req.params.address;
  const addressData = ftm.getAddressData(address);
  res.json({
    addressData: addressData
  })
});
  
app.listen(port, function () {
  console.log(`Listening on port ${port}...`);
});
