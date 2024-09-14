const fs = require('fs');
const {
    login,
    getAccountInfo,
    getGameInfo,
    getAccountBuildInfo,
    getSquadInfo,
    joinSquad,
    collectCoin,
    useSpecialBox,
    recoverCoinPool,
    getTaskList,
    finishTask,
    upgradeLevel,
    getOfflineYesPacBonusInfo,
    claimOfflineBonus,
    toggleSwipeBotSwitch
} = require('./src/api');
const { displayLogo, displayAccountInfo, displayGameInfo, autoCollectCoins } = require('./src/display');

const COLORS = {
    RESET: '\x1b[0m',
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    CYAN: '\x1b[36m',
};

const getCurrentTimestamp = () => new Date().toISOString();

class YesCoinBot {
    constructor() {
        this.accounts = this.loadAccounts('token.txt');
        this.tokens = this.loadTokens('token.json');
        this.cekTaskEnable = true;
        this.upgradeMultiEnable = true;
        this.upgradeFillEnable = true;
        this.maxLevel = 5;
    }

    loadAccounts(filePath) {
        return fs.readFileSync(filePath, 'utf-8').replace(/\r/g, '').split('\n').filter(Boolean);
    }

    loadTokens(filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (error) {
            return {};
        }
    }

    saveToken(accountIndex, token) {
        this.tokens[accountIndex] = token;
        fs.writeFileSync('token.json', JSON.stringify(this.tokens, null, 2));
    }

    async getOrRefreshToken(encodedData, accountIndex) {
        let token = this.tokens[accountIndex];
        if (token) {
            return token;
        }
        token = await login(encodedData);
        this.saveToken(accountIndex, token);
        return token;
    }

    async randomDelay() {
        const delay = Math.floor(Math.random() * 300) + 300;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    logInfo(message) {
        console.log(`${COLORS.CYAN}[INFO] ${getCurrentTimestamp()}: ${message}${COLORS.RESET}`);
    }

    logError(message) {
        console.error(`${COLORS.RED}[ERROR] ${getCurrentTimestamp()}: ${message}${COLORS.RESET}`);
    }

    logSuccess(message) {
        console.log(`${COLORS.GREEN}[SUCCESS] ${getCurrentTimestamp()}: ${message}${COLORS.RESET}`);
    }

    async handleSwipeBot(token) {
        try {
            const accountBuildInfo = await getAccountBuildInfo(token);
            if (accountBuildInfo === null) {
                this.logError('Failed to retrieve SwipeBot information. API returned null.');
                return;
            }

            if (accountBuildInfo.code === 0) {
                const { swipeBotLevel, openSwipeBot } = accountBuildInfo.data;
                if (swipeBotLevel < 1) {
                    await upgradeLevel(token, 4);
                    this.logSuccess('SwipeBot purchased successfully');
                }
                if (swipeBotLevel >= 1 && !openSwipeBot) {
                    await toggleSwipeBotSwitch(token, true);
                    this.logSuccess('SwipeBot activated successfully');
                }
                if (swipeBotLevel >= 1 && openSwipeBot) {
                    const offlineBonusInfo = await getOfflineYesPacBonusInfo(token);
                    if (offlineBonusInfo === null) {
                        this.logError('Failed to retrieve offline bonus information.');
                        return;
                    }
                    if (offlineBonusInfo.code === 0 && offlineBonusInfo.data.length > 0) {
                        const claimData = {
                            id: offlineBonusInfo.data[0].transactionId,
                            createAt: Math.floor(Date.now() / 1000),
                            claimType: 1,
                            destination: ""
                        };
                        const claimResponse = await claimOfflineBonus(token, claimData);
                        if (claimResponse === null) {
                            this.logError('Failed to claim offline bonus. API returned null.');
                            return;
                        }
                        if (claimResponse.code === 0) {
                            this.logSuccess(`Claimed offline bonus successfully, received ${claimResponse.data.collectAmount} coins`);
                        } else {
                            this.logError('Failed to claim offline bonus');
                        }
                    }
                }
            } else {
                this.logError(`Unexpected response code ${accountBuildInfo.code}`);
            }
        } catch (error) {
            this.logError(`Error handling SwipeBot: ${error.message}`);
        }
    }

    async main() {
        displayLogo();
        while (true) {
            for (let i = 0; i < this.accounts.length; i++) {
                const accountIndex = (i + 1).toString();
                const encodedData = this.accounts[i];
                let token;
                try {
                    token = await this.getOrRefreshToken(encodedData, accountIndex);
                } catch (error) {
                    this.logError(`Unable to get token for account ${accountIndex}: ${error.message}`);
                    continue;
                }
                await this.randomDelay();
                await displayAccountInfo(token);
                await displayGameInfo(token);

                await this.randomDelay();
                const squadInfo = await getSquadInfo(token);
                if (squadInfo && squadInfo.data.isJoinSquad) {
                    this.logInfo(`You have joined ${squadInfo.data.squadInfo.squadTitle} | ${squadInfo.data.squadInfo.squadMembers} Members`);
                } else {
                    this.logInfo('Squad: You are not in a Squad, joining wolvesbase.');
                    await this.randomDelay();
                    const joinResult = await joinSquad(token, "t.me/wolvesbase");
                    if (joinResult) {
                        this.logSuccess('Squad: Joined Squad successfully!');
                    } else {
                        this.logError('Squad: Failed to join Squad!');
                    }
                }

                await this.randomDelay();
                this.logInfo('Checking and handling SwipeBot...');
                await this.handleSwipeBot(token);

                if (this.cekTaskEnable) {
                    await this.randomDelay();
                    this.logInfo('Starting tasks...');
                    const tasks = await getTaskList(token);
                    if (tasks) {
                        for (const task of tasks) {
                            if (task.taskStatus === 0) {
                                await finishTask(token, task.taskId);
                                this.logSuccess(`Task ${task.taskId} completed`);
                            } else {
                                this.logInfo('Task already completed');
                            }
                        }
                    }
                }

                if (this.upgradeMultiEnable) {
                    await this.randomDelay();
                    this.logInfo('Starting multi upgrade...');
                    await upgradeLevel(token, this.maxLevel, '1');
                    this.logSuccess('Multi upgrade completed');
                }

                if (this.upgradeFillEnable) {
                    await this.randomDelay();
                    this.logInfo('Starting Fill Rate upgrade...');
                    await upgradeLevel(token, this.maxLevel, '2');
                    this.logSuccess('Fill Rate upgrade completed');
                }

                await this.randomDelay();
                const collectInfo = await getGameInfo(token);
                if (collectInfo === null) {
                    this.logError('Unable to get game data!');
                    continue;
                } else {
                    const { singleCoinValue, coinPoolLeftCount } = collectInfo.data;
                    this.logInfo(`Energy left ${coinPoolLeftCount}`);

                    if (coinPoolLeftCount > 0) {
                        await this.randomDelay();
                        const amount = Math.floor(coinPoolLeftCount / singleCoinValue);
                        const collectResult = await collectCoin(token, amount);
                        if (collectResult && collectResult.code === 0) {
                            this.logSuccess(`Tap successful, received ${collectResult.data.collectAmount} coins`);
                        } else {
                            this.logError('Tap unsuccessful!');
                        }
                    }
                }

                await this.randomDelay();
                this.logInfo('Checking remaining chests...');
                const gameInfo = await getAccountBuildInfo(token);
                if (gameInfo && gameInfo.data.specialBoxLeftRecoveryCount > 0) {
                    if (await useSpecialBox(token)) {
                        await this.randomDelay();
                        this.logInfo('Starting collection...');
                        await autoCollectCoins(token, 2, 240);
                        this.logSuccess('Collection completed');
                    }
                } else {
                    this.logInfo('No chests available!');
                }

                await this.randomDelay();
                this.logInfo('Starting recovery...');
                const updatedGameInfo = await getAccountBuildInfo(token);
                if (updatedGameInfo && updatedGameInfo.data.coinPoolLeftRecoveryCount > 0) {
                    if (await recoverCoinPool(token)) {
                        await this.randomDelay();
                        const updatedCollectInfo = await getGameInfo(token);
                        if (updatedCollectInfo) {
                            const { coinPoolLeftCount, singleCoinValue } = updatedCollectInfo.data;
                            if (coinPoolLeftCount > 0) {
                                await this.randomDelay();
                                const amount = Math.floor(coinPoolLeftCount / singleCoinValue);
                                const collectResult = await collectCoin(token, amount);
                                if (collectResult && collectResult.code === 0) {
                                    this.logSuccess(`Tap successful, received ${collectResult.data.collectAmount} coins`);
                                } else {
                                    this.logError('Tap unsuccessful!');
                                }
                            }
                        }
                    }
                } else {
                    this.logInfo('No more recovery available!');
                }

                await this.randomDelay();
                this.logInfo('Checking for free chest...');
                await autoCollectCoins(token, 100000, 200);
            }

            this.logInfo('Waiting for 2 minutes before next cycle...');
            await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        }
    }
}

const bot = new YesCoinBot();
bot.main();
