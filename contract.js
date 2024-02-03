document.addEventListener('DOMContentLoaded', async function () {
    await initWeb3();
    updateUI();
});

let web3;
let contractInstance;
let isTransactionPending = false;
async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
        } catch (error) {
            console.error("User denied account access");
        }
    } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
    } else {
        console.error("No Ethereum provider detected. Please install MetaMask");
    }

    const contractAddress = '0x63E0C2507769f75f94E124d0B461529A858648a2'; // Replace with your deployed contract address
    const contractABI = [
		{
			"inputs": [],
			"name": "enter",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [],
			"name": "getContractBalance",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getParticipants",
			"outputs": [
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "manager",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "participants",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "winner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	];

    contractInstance = new web3.eth.Contract(contractABI, contractAddress);
    const accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];

    const managerAddress = accounts[0];
}
async function updateUI() {
    try {
        const contractBalance = await contractInstance.methods.getContractBalance().call();
        const participants = await contractInstance.methods.getParticipants().call();
        const lastWinner = await contractInstance.methods.winner().call();

        document.getElementById('contractBalance').textContent = contractBalance;
        document.getElementById('participantsList').innerHTML = '';
        participants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = participant;
            document.getElementById('participantsList').appendChild(li);
        });
        document.getElementById('lastWinner').textContent = lastWinner;
    } catch (error) {
        console.error("Error updating UI:", error.message);
    }
    isTransactionPending = false;
    updateEnterButtonState();
}
async function enterLottery() {
    if (isTransactionPending) {
        return; // Prevent multiple submissions
    }

    try {
        isTransactionPending = true;
        updateEnterButtonState();

        await contractInstance.methods.enter().send({
            from: web3.eth.defaultAccount,
            value: web3.utils.toWei('0.2', 'ether')
        });
        updateUI();
    } catch (error) {
        console.error("Error entering lottery:", error.message);
        isTransactionPending = false;
        updateEnterButtonState();
    }
}

function updateEnterButtonState() {
    const enterButton = document.getElementById('enter');
    enterButton.textContent = isTransactionPending ? 'Processing...' : 'Enter Lottery (0.2 ETH)';
    enterButton.disabled = isTransactionPending;
}

const enterButton = document.getElementById('enter');
enterButton.addEventListener('click', enterLottery);
