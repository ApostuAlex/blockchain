const Blockchain = require('./blockchain');
const ftm = new Blockchain();

const ftm1 = {
    "chain": [
        {
            "index": 1,
            "timestamp": 1646810095285,
            "transactions": [

            ],
            "nonce": 1200,
            "hash": "asda2wscvc",
            "previousBlockHash": "ASD@@SCZXCZX"
        },
        {
            "index": 2,
            "timestamp": 1646810160595,
            "transactions": [

            ],
            "nonce": 17378,
            "hash": "0000364be76329b014a3fe7da0e876d2ee9227d23f3648309db8444e48bd1571",
            "previousBlockHash": "asda2wscvc"
        },
        {
            "index": 3,
            "timestamp": 1646810313990,
            "transactions": [
                {
                    "amount": 420,
                    "sender": "00dasdadasdadwawds",
                    "recipient": "9ecdc4a09f7811ec96f6a1c8dff50f8e",
                    "transactionID": "c5de60e09f7811ec96f6a1c8dff50f8e"
                },
                {
                    "amount": 33,
                    "sender": "DASDWDASACASdasdaca",
                    "recipient": "0000cdscsdcsdcasdas2sd",
                    "transactionID": "f703b5309f7811ec96f6a1c8dff50f8e"
                },
                {
                    "amount": 40,
                    "sender": "DASDWDASACASdasdaca",
                    "recipient": "0000cdscsdcsdcasdas2sd",
                    "transactionID": "fa9e68209f7811ec96f6a1c8dff50f8e"
                }
            ],
            "nonce": 17968,
            "hash": "0000c4bb9e89b3c9ac81f62753dcff8939b3f67372429a359ce2de9b14c1db93",
            "previousBlockHash": "0000364be76329b014a3fe7da0e876d2ee9227d23f3648309db8444e48bd1571"
        },
        {
            "index": 4,
            "timestamp": 1646810432562,
            "transactions": [
                {
                    "amount": 420,
                    "sender": "00dasdadasdadwawds",
                    "recipient": "9ecdc4a09f7811ec96f6a1c8dff50f8e",
                    "transactionID": "214964c09f7911ec96f6a1c8dff50f8e"
                }
            ],
            "nonce": 69784,
            "hash": "0000d71ca1f55644c637106e82de0ec31a8e8dfdb13945f2b18d22ae29d413a4",
            "previousBlockHash": "0000c4bb9e89b3c9ac81f62753dcff8939b3f67372429a359ce2de9b14c1db93"
        },
        {
            "index": 5,
            "timestamp": 1646810435621,
            "transactions": [
                {
                    "amount": 420,
                    "sender": "00dasdadasdadwawds",
                    "recipient": "9ecdc4a09f7811ec96f6a1c8dff50f8e",
                    "transactionID": "67f5bd609f7911ec96f6a1c8dff50f8e"
                }
            ],
            "nonce": 39059,
            "hash": "0000b11a9642397b14731493182c3b6588774f6cad95b0c95fb0918487b7b921",
            "previousBlockHash": "0000d71ca1f55644c637106e82de0ec31a8e8dfdb13945f2b18d22ae29d413a4"
        }
    ],
    "pendingTransactions": [
        {
            "amount": 420,
            "sender": "00dasdadasdadwawds",
            "recipient": "9ecdc4a09f7811ec96f6a1c8dff50f8e",
            "transactionID": "69c85a809f7911ec96f6a1c8dff50f8e"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": [

    ]
}


console.log(ftm.chainIsValid(ftm1.chain));


