import { Web3 } from 'web3';
import { Wallet } from 'ethers';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
];

class EdelFinance {
    constructor() {
        this.API_1 = "https://auth.privy.io/api/v1";
        this.API_2 = "https://new-backend-713705987386.europe-north1.run.app";
        
        this.RPC_URL = "https://base-mainnet.g.alchemy.com/v2/8tLSlmm95fjoFgamNTWgX";
        this.EXPLORER = "https://basescan.org/tx/";
        
        this.TOKENS = {
            "EDEL": {
                "address": "0xFb31f85A8367210B2e4Ed2360D2dA9Dc2D2Ccc95",
            },
            "mockUSD1": {
                "address": "0xAA465B5B06687eDe703437A7bF42A52A356c6e6c",
            },
            "mockSPY": {
                "address": "0x07C6a25739Ffe02b1dae12502632126fFA7497c2",
            },
            "mockUSDC": {
                "address": "0x66E8D8E1ba5cfaDB32df6CC0B45eA05Cc3d7201E",
            },
            "mockMETA": {
                "address": "0x960e1155741108C85A9BB554F79165df939E66BB",
            },
            "mockQQQ": {
                "address": "0xA0Aa9Dd11c6a770cEbB4772728538648F2de0F82",
            },
            "mockTSLA": {
                "address": "0x119505B31d369d5cF27C149A0d132D8Cdd99Cf5e",
            },
            "mockGOOGL": {
                "address": "0x367A8A0A55f405AA6980e44f3920463ABC6BB132",
            },
            "mockAAPL": {
                "address": "0xFBEfaE5034AA4cc7f3E9ac17E56d761a1bF211D4",
            },
            "mockAMZN": {
                "address": "0xA4a87f3F6b8aef9029f77edb55542cc32b8944D8",
            },
            "mockCRCL": {
                "address": "0xc1f76f5F8cab297a096Aec245b28B70B8822Bfa4",
            },
            "mockNVDA": {
                "address": "0x60C80e0086B1cFb0D21c9764E36d5bf469f7F158",
            },
            "mockPLTR": {
                "address": "0x6401999437FB8d6af9Df5AdEFe10D87F2AF3EC7d",
            },
            "mockHOOD": {
                "address": "0x856736DFf1579DDE3E35B278432c857Cb55Bc407",
            }
        };

        this.SPIN_CONTRACT_ADDRESS = "0x6fe7938cDeA9B04315B48EF60e325e19790CF5f6";
        this.REFER_CONTRACT_ADDRESS = "0x1d1aFC2d015963017bED1De13e4ed6c3d3ED1618";
        this.LENDING_POOL_ADDRESS = "0x0B72c91279A61cFcEc3FCd1BF30C794c69236e6e";

        this.CONTRACT_ABI = [
            {
                "inputs": [
                    { "internalType": "address", "name": "owner", "type": "address" },
                    { "internalType": "address", "name": "spender", "type": "address" }
                ],
                "name": "allowance",
                "outputs": [
                    { "internalType": "uint256", "name": "", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "spender", "type": "address" },
                    { "internalType": "uint256", "name": "value", "type": "uint256" }
                ],
                "name": "approve",
                "outputs": [
                    { "internalType": "bool", "name": "", "type": "bool" }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "account", "type": "address" }
                ],
                "name": "balanceOf",
                "outputs": [
                    { "internalType": "uint256", "name": "", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    { "internalType": "uint8", "name": "", "type": "uint8" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "", "type": "address" }
                ],
                "name": "freeSpins",
                "outputs": [
                    { "internalType": "uint256", "name": "", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "", "type": "address" }
                ],
                "name": "lastSpinPurchaseTimestamp",
                "outputs": [
                    { "internalType": "uint256", "name": "", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "", "type": "address" }
                ],
                "name": "paidSpins",
                "outputs": [
                    { "internalType": "uint256", "name": "", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "enum IEdelFaucet.PaymentToken", "name": "paymentMethod", "type": "uint8" },
                    { "internalType": "address", "name": "referral", "type": "address" }
                ],
                "name": "buySpin",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    { "internalType": "address", "name": "reserve", "type": "address" },
                    { "internalType": "uint256", "name": "amount", "type": "uint256" },
                    { "internalType": "address", "name": "onBehalfOf", "type": "address" },
                    { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
                ],
                "name": "deposit",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        this.PURCHASE_PRICE = 10;
        
        this.HEADERS = {};
        this.proxies = [];
        this.proxy_index = 0;
        this.account_proxies = {};
        this.ca_id = {};
        this.token = {};
        this.supply_option = 1;
    }

    clearTerminal() {
        console.clear();
    }

    log(message) {
        const now = new Date();
        const timeStr = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        console.log(
            `${chalk.cyan.bold(`[ ${timeStr} WIB ]`)}${chalk.white.bold(' | ')}${message}`
        );
    }

    welcome() {
        console.log(
            `\n${chalk.green.bold('Edel Finance')} ${chalk.blue.bold('Auto BOT')}\n` +
            `${chalk.green.bold('Rey?')} ${chalk.yellow.bold('<INI WATERMARK>')}\n`
        );
    }

    formatSeconds(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    async loadAccounts() {
        try {
            const data = await fs.readFile('accounts.txt', 'utf-8');
            const accounts = data.split('\n').map(line => line.trim()).filter(line => line);
            return accounts;
        } catch (e) {
            this.log(`${chalk.red.bold(`Failed To Load Accounts: ${e}`)}`);
            return null;
        }
    }

    async loadProxies() {
        try {
            const data = await fs.readFile('proxy.txt', 'utf-8');
            this.proxies = data.split('\n').map(line => line.trim()).filter(line => line);
            
            if (this.proxies.length === 0) {
                this.log(`${chalk.red.bold('No Proxies Found.')}`);
                return;
            }

            this.log(
                `${chalk.green.bold('Proxies Total  :')} ${chalk.white.bold(this.proxies.length)}`
            );
        } catch (e) {
            this.log(`${chalk.red.bold(`Failed To Load Proxies: ${e}`)}`);
            this.proxies = [];
        }
    }

    checkProxySchemes(proxy) {
        const schemes = ["http://", "https://", "socks4://", "socks5://"];
        if (schemes.some(scheme => proxy.startsWith(scheme))) {
            return proxy;
        }
        return `http://${proxy}`;
    }

    getNextProxyForAccount(account) {
        if (!this.account_proxies[account]) {
            if (this.proxies.length === 0) return null;
            const proxy = this.checkProxySchemes(this.proxies[this.proxy_index]);
            this.account_proxies[account] = proxy;
            this.proxy_index = (this.proxy_index + 1) % this.proxies.length;
        }
        return this.account_proxies[account];
    }

    rotateProxyForAccount(account) {
        if (this.proxies.length === 0) return null;
        const proxy = this.checkProxySchemes(this.proxies[this.proxy_index]);
        this.account_proxies[account] = proxy;
        this.proxy_index = (this.proxy_index + 1) % this.proxies.length;
        return proxy;
    }

    buildProxyConfig(proxy) {
        if (!proxy) return null;

        if (proxy.startsWith('socks')) {
            return new SocksProxyAgent(proxy);
        } else if (proxy.startsWith('http')) {
            return new HttpsProxyAgent(proxy);
        }

        throw new Error('Unsupported Proxy Type.');
    }

    generateAddress(privateKey) {
        try {
            const wallet = new Wallet(privateKey);
            return wallet.address;
        } catch (e) {
            return null;
        }
    }

    generateLoginPayload(privateKey, address, nonce) {
        try {
            const wallet = new Wallet(privateKey);
            const issuedAt = new Date().toISOString();
            const message = `testnet.edel.finance wants you to sign in with your Ethereum account:\n${address}\n\nBy signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.\n\nURI: https://testnet.edel.finance\nVersion: 1\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${issuedAt}\nResources:\n- https://privy.io`;
            
            const signature = wallet.signMessageSync(message);

            return {
                message,
                signature,
                chainId: "eip155:8453",
                walletClientType: "metamask",
                connectorType: "injected",
                mode: "login-or-sign-up"
            };
        } catch (e) {
            throw new Error(`Generate Login Payload Failed: ${e.message}`);
        }
    }

    generateSpinPayload(privateKey, address, isFreeSpin) {
        try {
            const wallet = new Wallet(privateKey);
            const timestamp = Date.now();

            const message = JSON.stringify({
                account: address,
                useFreeSpin: isFreeSpin,
                timestamp
            });

            const signature = wallet.signMessageSync(message);

            return {
                signature,
                walletAddress: address,
                timestamp,
                useFreeSpin: isFreeSpin
            };
        } catch (e) {
            throw new Error(`Generate Spin Payload Failed: ${e.message}`);
        }
    }

    maskAccount(account) {
        try {
            return account.slice(0, 6) + '*'.repeat(6) + account.slice(-6);
        } catch (e) {
            return null;
        }
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async getWeb3WithCheck(address, useProxy, retries = 3, timeout = 60000) {
        const proxy = useProxy ? this.getNextProxyForAccount(address) : null;
        
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const config = {};
                if (proxy) {
                    config.agent = this.buildProxyConfig(proxy);
                    config.timeout = timeout;
                }

                const web3 = new Web3(new Web3.providers.HttpProvider(this.RPC_URL, config));
                await web3.eth.getBlockNumber();
                return web3;
            } catch (e) {
                if (attempt < retries - 1) {
                    await sleep(3000);
                    continue;
                }
                throw new Error(`Failed to Connect to RPC: ${e.message}`);
            }
        }
    }

    async lastPurchaseTime(address, useProxy) {
        try {
            const web3 = await this.getWeb3WithCheck(address, useProxy);
            const contract = new web3.eth.Contract(this.CONTRACT_ABI, this.SPIN_CONTRACT_ADDRESS);
            const timestamp = await contract.methods.lastSpinPurchaseTimestamp(address).call();
            return Number(timestamp);
        } catch (e) {
            this.log(
                `${chalk.blue.bold('   Status   :')}${chalk.red.bold(' Failed to Fetch Last Spin Purchase Timestamp')}`
            );
            this.log(
                `${chalk.blue.bold('   Message  :')}${chalk.red.bold(` ${e.message}`)}`
            );
            return null;
        }
    }

    async getFreeSpins(address, useProxy) {
        try {
            const web3 = await this.getWeb3WithCheck(address, useProxy);
            const contract = new web3.eth.Contract(this.CONTRACT_ABI, this.SPIN_CONTRACT_ADDRESS);
            const freeSpins = await contract.methods.freeSpins(address).call();
            return Number(freeSpins);
        } catch (e) {
            this.log(
                `${chalk.blue.bold('   Status   :')}${chalk.red.bold(' Failed to Fetch Available Free Spins')}`
            );
            this.log(
                `${chalk.blue.bold('   Message  :')}${chalk.red.bold(` ${e.message}`)}`
            );
            return null;
        }
    }

    async getPaidSpins(address, useProxy) {
        try {
            const web3 = await this.getWeb3WithCheck(address, useProxy);
            const contract = new web3.eth.Contract(this.CONTRACT_ABI, this.SPIN_CONTRACT_ADDRESS);
            const paidSpins = await contract.methods.paidSpins(address).call();
            return Number(paidSpins);
        } catch (e) {
            this.log(
                `${chalk.blue.bold('   Status   :')}${chalk.red.bold(' Failed to Fetch Available Paid Spins')}`
            );
            this.log(
                `${chalk.blue.bold('   Message  :')}${chalk.red.bold(` ${e.message}`)}`
            );
            return null;
        }
    }

    async getTokenBalance(address, tokenAddress, useProxy) {
        try {
            const web3 = await this.getWeb3WithCheck(address, useProxy);
            const contract = new web3.eth.Contract(this.CONTRACT_ABI, tokenAddress);
            const balance = await contract.methods.balanceOf(address).call();
            const decimals = await contract.methods.decimals().call();
            
            return Number(balance) / Math.pow(10, Number(decimals));
        } catch (e) {
            this.log(
                `${chalk.blue.bold('   Status   :')}${chalk.red.bold(' Failed to Fetch Token Balance')}`
            );
            this.log(
                `${chalk.blue.bold('   Message  :')}${chalk.red.bold(` ${e.message}`)}`
            );
            return null;
        }
    }

    async sendRawTransactionWithRetries(privateKey, web3, tx, retries = 5) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                return receipt.transactionHash;
            } catch (e) {
                this.log(
                    `${chalk.blue.bold('   Message  :')}${chalk.yellow.bold(` [Attempt ${attempt + 1}] Send TX Error: ${e.message}`)}`
                );
                if (attempt < retries - 1) {
                    await sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw new Error('Transaction Hash Not Found After Maximum Retries');
    }

    async waitForReceiptWithRetries(web3, txHash, retries = 5) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const receipt = await web3.eth.getTransactionReceipt(txHash);
                if (receipt) return receipt;
                await sleep(2000);
            } catch (e) {
                this.log(
                    `${chalk.blue.bold('   Message  :')}${chalk.yellow.bold(` [Attempt ${attempt + 1}] Wait for Receipt Error: ${e.message}`)}`
                );
                if (attempt < retries - 1) {
                    await sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw new Error('Transaction Receipt Not Found After Maximum Retries');
    }

    async approvingToken(privateKey, address, assetAddress, spenderAddress, amountToWei, useProxy) {
        try {
            const web3 = await this.getWeb3WithCheck(address, useProxy);
            const contract = new web3.eth.Contract(this.CONTRACT_ABI, assetAddress);

            const allowance = await contract.methods.allowance(address, spenderAddress).call();
            
            if (BigInt(allowance) < BigInt(amountToWei)) {
                const maxApproval = BigInt(2) ** BigInt(256) - BigInt(1);
                const data = contract.methods.approve(spenderAddress, maxApproval.toString()).encodeABI();
                
                const gasEstimate = await contract.methods.approve(spenderAddress, maxApproval.toString()).estimateGas({ from: address });
                const maxPriorityFee = web3.utils.toWei('0.01', 'gwei');
                const nonce = await web3.eth.getTransactionCount(address, 'pending');
                const chainId = await web3.eth.getChainId();

                const tx = {
                    from: address,
                    to: assetAddress,
                    data,
                    gas: Math.floor(Number(gasEstimate) * 1.2),
                    maxFeePerGas: maxPriorityFee,
                    maxPriorityFeePerGas: maxPriorityFee,
                    nonce,
                    chainId
                };

                const txHash = await this.sendRawTransactionWithRetries(privateKey, web3, tx);
                const receipt = await this.waitForReceiptWithRetries(web3, txHash);

                this.log(`${chalk.blue.bold('   Approve  :')}${chalk.green.bold(' Success')}`);
                this.log(`${chalk.blue.bold('   Block    :')}${chalk.white.bold(` ${receipt.blockNumber}`)}`);
                this.log(`${chalk.blue.bold('   Tx Hash  :')}${chalk.white.bold(` ${txHash}`)}`);
                this.log(`${chalk.blue.bold('   Explorer :')}${chalk.white.bold(` ${this.EXPLORER}${txHash}`)}`);
                
                await sleep(Math.random() * 2000 + 3000);
            }

            return true;
        } catch (e) {
            throw new Error(`Approving Token Contract Failed: ${e.message}`);
        }
    }

    async performBuySpin(privateKey, address, useProxy) {
        try {
            const web3 = await this.getWeb3WithCheck(address, useProxy);
            const tokenContract = new web3.eth.Contract(this.CONTRACT_ABI, this.TOKENS.EDEL.address);
            const decimals = await tokenContract.methods.decimals().call();
            const amountToWei = BigInt(this.PURCHASE_PRICE) * BigInt(10) ** BigInt(decimals);

            await this.approvingToken(
                privateKey,
                address,
                this.TOKENS.EDEL.address,
                this.SPIN_CONTRACT_ADDRESS,
                amountToWei.toString(),
                useProxy
            );

            const spinContract = new web3.eth.Contract(this.CONTRACT_ABI, this.SPIN_CONTRACT_ADDRESS);
            const data = spinContract.methods.buySpin(2, this.REFER_CONTRACT_ADDRESS).encodeABI();
            
            const gasEstimate = await spinContract.methods.buySpin(2, this.REFER_CONTRACT_ADDRESS).estimateGas({ 
                from: address, 
                value: 0 
            });

            const maxPriorityFee = web3.utils.toWei('0.01', 'gwei');
            const nonce = await web3.eth.getTransactionCount(address, 'pending');
            const chainId = await web3.eth.getChainId();

            const tx = {
                from: address,
                to: this.SPIN_CONTRACT_ADDRESS,
                data,
                value: 0,
                gas: Math.floor(Number(gasEstimate) * 1.2),
                maxFeePerGas: maxPriorityFee,
                maxPriorityFeePerGas: maxPriorityFee,
                nonce,
                chainId
            };

            const txHash = await this.sendRawTransactionWithRetries(privateKey, web3, tx);
            const receipt = await this.waitForReceiptWithRetries(web3, txHash);

            return {
                tx_hash: txHash,
                block: receipt.blockNumber
            };
        } catch (e) {
            this.log(`${chalk.blue.bold('   Status   :')}${chalk.red.bold(' Failed to Perform On-Chain Transaction')}`);
            this.log(`${chalk.blue.bold('   Message  :')}${chalk.red.bold(` ${e.message}`)}`);
            return null;
        }
    }

    async performSupplyToken(privateKey, address, tokenAddress, amount, useProxy) {
        try {
            const web3 = await this.getWeb3WithCheck(address, useProxy);
            const tokenContract = new web3.eth.Contract(this.CONTRACT_ABI, tokenAddress);
            const decimals = await tokenContract.methods.decimals().call();
            const amountToWei = BigInt(Math.floor(amount * Math.pow(10, Number(decimals))));

            await this.approvingToken(
                privateKey,
                address,
                tokenAddress,
                this.LENDING_POOL_ADDRESS,
                amountToWei.toString(),
                useProxy
            );

            const poolContract = new web3.eth.Contract(this.CONTRACT_ABI, this.LENDING_POOL_ADDRESS);
            const data = poolContract.methods.deposit(tokenAddress, amountToWei.toString(), address, 0).encodeABI();
            
            const gasEstimate = await poolContract.methods.deposit(tokenAddress, amountToWei.toString(), address, 0).estimateGas({ 
                from: address 
            });

            const maxPriorityFee = web3.utils.toWei('0.01', 'gwei');
            const nonce = await web3.eth.getTransactionCount(address, 'pending');
            const chainId = await web3.eth.getChainId();

            const tx = {
                from: address,
                to: this.LENDING_POOL_ADDRESS,
                data,
                gas: Math.floor(Number(gasEstimate) * 1.2),
                maxFeePerGas: maxPriorityFee,
                maxPriorityFeePerGas: maxPriorityFee,
                nonce,
                chainId
            };

            const txHash = await this.sendRawTransactionWithRetries(privateKey, web3, tx);
            const receipt = await this.waitForReceiptWithRetries(web3, txHash);

            return {
                tx_hash: txHash,
                block: receipt.blockNumber
            };
        } catch (e) {
            this.log(`${chalk.blue.bold('   Status   :')}${chalk.red.bold(' Failed to Perform On-Chain Transaction')}`);
            this.log(`${chalk.blue.bold('   Message  :')}${chalk.red.bold(` ${e.message}`)}`);
            return null;
        }
    }

    async processPerformBuySpin(privateKey, address, useProxy) {
        const onchain = await this.performBuySpin(privateKey, address, useProxy);
        if (!onchain) return false;

        this.log(`${chalk.blue.bold('   Status   :')}${chalk.green.bold(' Success')}`);
        this.log(`${chalk.blue.bold('   Block    :')}${chalk.white.bold(` ${onchain.block}`)}`);
        this.log(`${chalk.blue.bold('   Tx Hash  :')}${chalk.white.bold(` ${onchain.tx_hash}`)}`);
        this.log(`${chalk.blue.bold('   Explorer :')}${chalk.white.bold(` ${this.EXPLORER}${onchain.tx_hash}`)}`);

        return true;
    }

    async processPerformSupplyToken(privateKey, address, tokenAddress, amount, useProxy) {
        const onchain = await this.performSupplyToken(privateKey, address, tokenAddress, amount, useProxy);
        if (!onchain) return false;

        this.log(`${chalk.blue.bold('   Status   :')}${chalk.green.bold(' Success')}`);
        this.log(`${chalk.blue.bold('   Block    :')}${chalk.white.bold(` ${onchain.block}`)}`);
        this.log(`${chalk.blue.bold('   Tx Hash  :')}${chalk.white.bold(` ${onchain.tx_hash}`)}`);
        this.log(`${chalk.blue.bold('   Explorer :')}${chalk.white.bold(` ${this.EXPLORER}${onchain.tx_hash}`)}`);

        return true;
    }

    async checkConnection(address, useProxy) {
        try {
            const config = { timeout: 30000 };
            if (useProxy) {
                const proxy = this.getNextProxyForAccount(address);
                config.httpsAgent = this.buildProxyConfig(proxy);
            }

            await axios.get('https://api.ipify.org?format=json', config);
            return true;
        } catch (e) {
            this.log(
                `${chalk.cyan.bold('Status:')}${chalk.red.bold(' Connection Not 200 OK')} ${chalk.magenta.bold('-')} ${chalk.yellow.bold(e.message)}`
            );
            return null;
        }
    }

    async siweInit(address, useProxy, retries = 5) {
        const url = `${this.API_1}/siwe/init`;
        const data = { address };
        const headers = {
            ...this.HEADERS[address],
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Privy-App-Id': 'cmf5gt8yi019ljv0bn5k8xrdw',
            'Privy-Ca-Id': this.ca_id[address],
            'Privy-Client': 'react-auth:3.0.1'
        };

        await sleep(Math.random() * 500 + 500);

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const config = { headers, timeout: 60000 };
                if (useProxy) {
                    const proxy = this.getNextProxyForAccount(address);
                    config.httpsAgent = this.buildProxyConfig(proxy);
                }

                const response = await axios.post(url, data, config);
                return response.data;
            } catch (e) {
                if (attempt < retries - 1) {
                    await sleep(5000);
                    continue;
                }
                this.log(
                    `${chalk.cyan.bold('Status:')}${chalk.red.bold(' Init Failed')} ${chalk.magenta.bold('-')} ${chalk.yellow.bold(e.message)}`
                );
            }
        }
        return null;
    }

    async siweAuthenticate(privateKey, address, nonce, useProxy, retries = 5) {
        const url = `${this.API_1}/siwe/authenticate`;
        const data = this.generateLoginPayload(privateKey, address, nonce);
        const headers = {
            ...this.HEADERS[address],
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Privy-App-Id': 'cmf5gt8yi019ljv0bn5k8xrdw',
            'Privy-Ca-Id': this.ca_id[address],
            'Privy-Client': 'react-auth:3.0.1'
        };

        await sleep(Math.random() * 500 + 500);

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const config = { headers, timeout: 60000 };
                if (useProxy) {
                    const proxy = this.getNextProxyForAccount(address);
                    config.httpsAgent = this.buildProxyConfig(proxy);
                }

                const response = await axios.post(url, data, config);
                return response.data;
            } catch (e) {
                if (attempt < retries - 1) {
                    await sleep(5000);
                    continue;
                }
                this.log(
                    `${chalk.cyan.bold('Status:')}${chalk.red.bold(' Authenticate Failed')} ${chalk.magenta.bold('-')} ${chalk.yellow.bold(e.message)}`
                );
            }
        }
        return null;
    }

    async luckySpin(privateKey, address, isFreeSpin, useProxy, retries = 5) {
        const url = `${this.API_2}/lucky-spin/spin`;
        const data = this.generateSpinPayload(privateKey, address, isFreeSpin);
        const headers = {
            ...this.HEADERS[address],
            'Authorization': `Bearer ${this.token[address]}`,
            'Content-Type': 'application/json'
        };

        await sleep(Math.random() * 500 + 500);

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const config = { headers, timeout: 60000 };
                if (useProxy) {
                    const proxy = this.getNextProxyForAccount(address);
                    config.httpsAgent = this.buildProxyConfig(proxy);
                }

                const response = await axios.post(url, data, config);
                return response.data;
            } catch (e) {
                if (attempt < retries - 1) {
                    await sleep(5000);
                    continue;
                }
                this.log(`${chalk.blue.bold('     Spin     :')}${chalk.red.bold(' Failed')}`);
                this.log(`${chalk.blue.bold('     Message  :')}${chalk.yellow.bold(` ${e.message}`)}`);
            }
        }
        return null;
    }

    async processCheckConnection(address, useProxy, rotateProxy) {
        while (true) {
            const proxy = useProxy ? this.getNextProxyForAccount(address) : null;
            this.log(`${chalk.cyan.bold('Proxy :')} ${chalk.white.bold(proxy || 'None')}`);

            const check = await this.checkConnection(address, useProxy);
            if (check) return true;

            if (rotateProxy) {
                this.rotateProxyForAccount(address);
                await sleep(1000);
                continue;
            }

            return false;
        }
    }

    async processLogin(privateKey, address, useProxy, rotateProxy) {
        const isValid = await this.processCheckConnection(address, useProxy, rotateProxy);
        if (isValid) {
            const init = await this.siweInit(address, useProxy);
            if (!init) return false;

            const nonce = init.nonce;
            const authenticate = await this.siweAuthenticate(privateKey, address, nonce, useProxy);
            if (!authenticate) return false;

            this.token[address] = authenticate.token;
            this.log(`${chalk.cyan.bold('Status:')}${chalk.green.bold(' Login Success')}`);

            return true;
        }
        return false;
    }

    async processOption1(privateKey, address, useProxy) {
        this.log(`${chalk.cyan.bold('Spin  :')}`);
        this.log(`${chalk.magenta.bold(' ● ')}${chalk.green.bold('Free Spins')}`);

        const freeSpins = await this.getFreeSpins(address, useProxy);
        if (freeSpins !== null) {
            this.log(`${chalk.blue.bold('   Available:')} ${chalk.white.bold(`${freeSpins} Free Spins`)}`);

            if (freeSpins > 0) {
                for (let i = 0; i < freeSpins; i++) {
                    this.log(`${chalk.green.bold('   ● ')}${chalk.white.bold(`${i + 1}/${freeSpins}`)}`);

                    const spin = await this.luckySpin(privateKey, address, true, useProxy);
                    if (!spin) continue;

                    if (!spin.success) {
                        this.log(`${chalk.blue.bold('     Spin     :')}${chalk.red.bold(' Failed')}`);
                        continue;
                    }

                    const txHash = spin.txnHash;
                    this.log(`${chalk.blue.bold('     Spin     :')}${chalk.green.bold(' Success')}`);
                    this.log(`${chalk.blue.bold('     Tx Hash  :')} ${chalk.white.bold(txHash)}`);
                    this.log(`${chalk.blue.bold('     Explorer :')} ${chalk.white.bold(`${this.EXPLORER}${txHash}`)}`);

                    await sleep(Math.random() * 2000 + 3000);
                }
            }
        }

        this.log(`${chalk.magenta.bold(' ● ')}${chalk.green.bold('Paid Spins')}`);

        const paidSpins = await this.getPaidSpins(address, useProxy);
        if (paidSpins !== null) {
            this.log(`${chalk.blue.bold('   Available:')} ${chalk.white.bold(`${paidSpins} Paid Spins`)}`);

            if (paidSpins === 0) {
                const lastPurchase = await this.lastPurchaseTime(address, useProxy);
                if (lastPurchase === null) return false;

                const timestamp = Math.floor(Date.now() / 1000);
                const nextPurchase = lastPurchase + 24 * 60 * 60;

                if (timestamp <= nextPurchase) {
                    this.log(`${chalk.blue.bold('   Status   :')}${chalk.yellow.bold(' Not Time to Buy Spin')}`);
                    return false;
                }

                this.log(`${chalk.blue.bold('   Price    :')} ${chalk.white.bold(`${this.PURCHASE_PRICE} EDEL`)}`);

                const balance = await this.getTokenBalance(address, this.TOKENS.EDEL.address, useProxy);
                if (balance === null) return false;

                this.log(`${chalk.blue.bold('   Balance  :')} ${chalk.white.bold(`${balance} EDEL`)}`);

                if (balance < this.PURCHASE_PRICE) {
                    this.log(`${chalk.blue.bold('   Status   :')}${chalk.yellow.bold(' Insufficient EDEL Token Balance')}`);
                    return false;
                }

                const onchain = await this.processPerformBuySpin(privateKey, address, useProxy);
                if (!onchain) return false;

                // Update paid spins after purchase
                const updatedPaidSpins = 1;
                
                for (let i = 0; i < updatedPaidSpins; i++) {
                    this.log(`${chalk.green.bold('   ● ')}${chalk.white.bold(`${i + 1}/${updatedPaidSpins}`)}`);
                    await sleep(Math.random() * 2000 + 3000);

                    const spin = await this.luckySpin(privateKey, address, false, useProxy);
                    if (!spin) continue;

                    if (!spin.success) {
                        this.log(`${chalk.blue.bold('     Spin     :')}${chalk.red.bold(' Failed')}`);
                        continue;
                    }

                    const txHash = spin.txnHash;
                    this.log(`${chalk.blue.bold('     Spin     :')}${chalk.green.bold(' Success')}`);
                    this.log(`${chalk.blue.bold('     Tx Hash  :')} ${chalk.white.bold(txHash)}`);
                    this.log(`${chalk.blue.bold('     Explorer :')} ${chalk.white.bold(`${this.EXPLORER}${txHash}`)}`);
                }
            } else {
                for (let i = 0; i < paidSpins; i++) {
                    this.log(`${chalk.green.bold('   ● ')}${chalk.white.bold(`${i + 1}/${paidSpins}`)}`);
                    await sleep(Math.random() * 2000 + 3000);

                    const spin = await this.luckySpin(privateKey, address, false, useProxy);
                    if (!spin) continue;

                    if (!spin.success) {
                        this.log(`${chalk.blue.bold('     Spin     :')}${chalk.red.bold(' Failed')}`);
                        continue;
                    }

                    const txHash = spin.txnHash;
                    this.log(`${chalk.blue.bold('     Spin     :')}${chalk.green.bold(' Success')}`);
                    this.log(`${chalk.blue.bold('     Tx Hash  :')} ${chalk.white.bold(txHash)}`);
                    this.log(`${chalk.blue.bold('     Explorer :')} ${chalk.white.bold(`${this.EXPLORER}${txHash}`)}`);
                }
            }
        }
    }

    async processOption2(privateKey, address, useProxy) {
        this.log(`${chalk.cyan.bold('Supply:')}`);

        for (const [symbol, data] of Object.entries(this.TOKENS)) {
            if (symbol === 'EDEL') continue;

            await sleep(Math.random() * 2000 + 3000);

            this.log(`${chalk.magenta.bold(' ● ')}${chalk.green.bold(symbol)}`);

            const balance = await this.getTokenBalance(address, data.address, useProxy);
            if (balance === null) continue;

            this.log(`${chalk.blue.bold('   Balance  :')} ${chalk.white.bold(`${balance} ${symbol}`)}`);

            if (balance === 0) {
                this.log(`${chalk.blue.bold('   Status   :')}${chalk.yellow.bold(` Insufficient ${symbol} Token Balance`)}`);
                continue;
            }

            let amount;
            if (this.supply_option === 1) {
                amount = balance * 0.25;
            } else if (this.supply_option === 2) {
                amount = balance * 0.5;
            } else if (this.supply_option === 3) {
                amount = balance * 0.75;
            } else if (this.supply_option === 4) {
                amount = balance * 1;
            }

            this.log(`${chalk.blue.bold('   Amount   :')} ${chalk.white.bold(`${amount} ${symbol}`)}`);

            await this.processPerformSupplyToken(privateKey, address, data.address, amount, useProxy);
        }
    }

    async processAccounts(privateKey, address, option, useProxy, rotateProxy) {
        const isLoggedIn = await this.processLogin(privateKey, address, useProxy, rotateProxy);
        if (isLoggedIn) {
            if (option === 1) {
                this.log(`${chalk.cyan.bold('Option:')} ${chalk.blue.bold('Lucky Spin')}`);
                await this.processOption1(privateKey, address, useProxy);
            } else if (option === 2) {
                this.log(`${chalk.cyan.bold('Option:')} ${chalk.blue.bold('Supply Token')}`);
                await this.processOption2(privateKey, address, useProxy);
            } else if (option === 3) {
                this.log(`${chalk.cyan.bold('Option:')} ${chalk.blue.bold('Run All Features')}`);
                await this.processOption1(privateKey, address, useProxy);
                await this.processOption2(privateKey, address, useProxy);
            }
        }
    }

    async printQuestion() {
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (query) => new Promise((resolve) => rl.question(query, resolve));

        let option;
        while (true) {
            console.log(`${chalk.green.bold('Select Option:')}`);
            console.log(`${chalk.white.bold('1. Lucky Spin')}`);
            console.log(`${chalk.white.bold('2. Supply Token')}`);
            console.log(`${chalk.white.bold('3. Run All Features')}`);
            
            const answer = await question(`${chalk.blue.bold('Choose [1/2/3] -> ')}`);
            option = parseInt(answer.trim());

            if ([1, 2, 3].includes(option)) {
                const optionType = option === 1 ? 'Lucky Spin' : option === 2 ? 'Supply Token' : 'Run All Features';
                console.log(`${chalk.green.bold(`${optionType} Selected.`)}`);
                break;
            } else {
                console.log(`${chalk.red.bold('Please enter either 1, 2, or 3.')}`);
            }
        }

        if ([2, 3].includes(option)) {
            while (true) {
                console.log(`${chalk.green.bold('Select Supply Option:')}`);
                console.log(`${chalk.white.bold('1. Supply 25%')}`);
                console.log(`${chalk.white.bold('2. Supply 50%')}`);
                console.log(`${chalk.white.bold('3. Supply 75%')}`);
                console.log(`${chalk.white.bold('4. Supply 100%')}`);
                
                const answer = await question(`${chalk.blue.bold('Choose [1/2/3/4] -> ')}`);
                const supplyOption = parseInt(answer.trim());

                if ([1, 2, 3, 4].includes(supplyOption)) {
                    const supplyType = supplyOption === 1 ? 'Supply 25%' : supplyOption === 2 ? 'Supply 50%' : supplyOption === 3 ? 'Supply 75%' : 'Supply 100%';
                    console.log(`${chalk.green.bold(`${supplyType} Selected.`)}`);
                    this.supply_option = supplyOption;
                    break;
                } else {
                    console.log(`${chalk.red.bold('Please enter either 1, 2, 3, or 4.')}`);
                }
            }
        }

        let proxyChoice;
        while (true) {
            console.log(`${chalk.white.bold('1. Run With Proxy')}`);
            console.log(`${chalk.white.bold('2. Run Without Proxy')}`);
            
            const answer = await question(`${chalk.blue.bold('Choose [1/2] -> ')}`);
            proxyChoice = parseInt(answer.trim());

            if ([1, 2].includes(proxyChoice)) {
                const proxyType = proxyChoice === 1 ? 'With' : 'Without';
                console.log(`${chalk.green.bold(`Run ${proxyType} Proxy Selected.`)}`);
                break;
            } else {
                console.log(`${chalk.red.bold('Please enter either 1 or 2.')}`);
            }
        }

        let rotateProxy = false;
        if (proxyChoice === 1) {
            while (true) {
                const answer = await question(`${chalk.blue.bold('Rotate Invalid Proxy? [y/n] -> ')}`);
                const rotate = answer.trim().toLowerCase();

                if (['y', 'n'].includes(rotate)) {
                    rotateProxy = rotate === 'y';
                    break;
                } else {
                    console.log(`${chalk.red.bold("Invalid input. Enter 'y' or 'n'.")}`);
                }
            }
        }

        rl.close();
        return { option, proxyChoice, rotateProxy };
    }

    async main() {
        try {
            const accounts = await this.loadAccounts();
            if (!accounts) return;

            const { option, proxyChoice, rotateProxy } = await this.printQuestion();

            while (true) {
                this.clearTerminal();
                this.welcome();
                this.log(`${chalk.green.bold("Account's Total:")} ${chalk.white.bold(accounts.length)}`);

                const useProxy = proxyChoice === 1;
                if (useProxy) await this.loadProxies();

                const separator = '='.repeat(25);
                for (let idx = 0; idx < accounts.length; idx++) {
                    const account = accounts[idx];
                    if (account) {
                        const address = this.generateAddress(account);
                        this.log(
                            `${chalk.cyan.bold(separator)}${chalk.cyan.bold('[')}${chalk.white.bold(` ${idx + 1} `)}${chalk.cyan.bold('-')}${chalk.white.bold(` ${this.maskAccount(address)} `)}${chalk.cyan.bold(']')}${chalk.cyan.bold(separator)}`
                        );

                        if (!address) {
                            this.log(`${chalk.cyan.bold('Status:')}${chalk.red.bold(' Invalid Private Key or Library Version Not Supported')}`);
                            continue;
                        }

                        this.ca_id[address] = this.generateUUID();
                        this.HEADERS[address] = {
                            'Accept': '*/*',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                            'Cache-Control': 'no-cache',
                            'Origin': 'https://testnet.edel.finance',
                            'Pragma': 'no-cache',
                            'Referer': 'https://testnet.edel.finance/',
                            'Sec-Fetch-Dest': 'empty',
                            'Sec-Fetch-Mode': 'cors',
                            'Sec-Fetch-Site': 'cross-site',
                            'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
                        };

                        await this.processAccounts(account, address, option, useProxy, rotateProxy);
                    }
                }

                this.log(`${chalk.cyan.bold('='.repeat(72))}`);
                let seconds = 24 * 60 * 60;
                while (seconds > 0) {
                    const formattedTime = this.formatSeconds(seconds);
                    process.stdout.write(
                        `\r${chalk.cyan.bold('[ Wait for')} ${chalk.white.bold(formattedTime)} ${chalk.cyan.bold('... ]')} ${chalk.white.bold('|')} ${chalk.blue.bold('All Accounts Have Been Processed.')}`
                    );
                    await sleep(1000);
                    seconds--;
                }
                console.log('');
            }
        } catch (e) {
            this.log(`${chalk.red.bold(`Error: ${e.message}`)}`);
            throw e;
        }
    }
}

// Run the bot
const bot = new EdelFinance();
bot.main().catch((e) => {
    console.error(e);
    process.exit(1);
});
