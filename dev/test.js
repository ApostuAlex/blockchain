const Blockchain = require('./blockchain');

const ftm = new Blockchain();

// ftm.createNewBlock(2393, "0908", "009s");
// ftm.createNewTransaction('100ftm', '09das9ds0da', '420dasda2asdasd'); 
// ftm.createNewBlock(231231, "9939292292", "2312312312"); 


const previousBlockHash = "099das0dsadasdwd21sadadasdasda";
const currentBlockData = [
    {
        amount: 10,
        sender: "#@#!",
        recipient: "ADASDas1"
    },
    {
        amount: 10,
        sender: "DASDSACAXZCCZXC",
        recipient: "DASD721EDSBUDASN"
    },
    {
        amount: 10,
        sender: "GFGDGDGSDGS",
        recipient: "DASNDASDNASDSAJDASNDA"
    }
];



console.log(ftm.hashBlock(previousBlockHash, currentBlockData,30328));



