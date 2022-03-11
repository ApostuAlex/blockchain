const { format } = require("express/lib/response");
const sha256 = require("sha256");
const currentNodeUrl = process.argv[3];
const uniqueID = require("uuid");

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];

  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.createNewBlock(1200, "ASD@@SCZXCZX", "asda2wscvc");
}

Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash,
  };

  this.pendingTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    amount: amount,
    sender: sender,
    recipient: recipient,
    transactionID: uniqueID.v1().split("-").join(""),
  };

  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function (
  transactionObj
) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()["index"] + 1;
};

Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);

  return hash;
};

Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }

  return nonce;
};

Blockchain.prototype.chainIsValid = function (blockchain) {
  let validChain = true;
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(prevBlock["hash"], { transactions: currentBlock["transactions"], index: currentBlock["index"] }, currentBlock["nonce"]);

    if (blockHash.substring(0, 4) !== '0000')
      validChain = false;

    if (currentBlock["previousBlockHash"] !== prevBlock["hash"])
      validChain = false
  }

  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock['nonce'] === 1200;
  const correctPreviousHash = genesisBlock['previousBlockHash'] === "ASD@@SCZXCZX";
  const correctHash = genesisBlock['hash'] === "asda2wscvc";
  const correctTransactions = genesisBlock['transactions'].length === 0;

  if (!correctNonce || !correctPreviousHash || !correctHash || !correctTransactions)
    validChain = false;

  return validChain;
}

Blockchain.prototype.getBlock = function (blockHash) {
  let correctBlock = null;
  this.chain.forEach(block => {
    if (block.hash === blockHash)
      correctBlock = block;
  })
  return correctBlock;
}

Blockchain.prototype.getTransaction = function (transactionID) {
  let correctTransaction = null;
  let correctBlock = null

  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.transactionID === transactionID) {
        correctTransaction = transaction;
        correctBlock = block;
      }
    });
  })
  return {
    transaction: correctTransaction,
    block: correctBlock
  }
}

Blockchain.prototype.getAddressData = function (address) {
  let addressTransactions = [];
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      if (transaction.sender === address || transaction.recipient === address) {
        addressTransactions.push(transaction);
      }
    })
  })
  let balanceOfAddress = 0;
  addressTransactions.forEach(transaction => {
    if (transaction.recipient === address) balanceOfAddress += transaction.amount;
    else if (transaction.sender === address) balanceOfAddress -= transaction.amount;
  })

  return {
    addressTransactions: addressTransactions,
    addressBalance: balanceOfAddress
  }
}

module.exports = Blockchain;
