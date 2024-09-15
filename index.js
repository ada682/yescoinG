const fs = require('fs');
const { login, getAccountInfo, getGameInfo, getAccountBuildInfo, getSquadInfo, joinSquad, collectCoin, useSpecialBox, recoverCoinPool, getTaskList, finishTask, upgradeLevel, getOfflineYesPacBonusInfo, claimOfflineBonus, toggleSwipeBotSwitch } = require('./src/api');
const { displayLogo, displayAccountInfo, displayGameInfo, autoCollectCoins } = require('./src/display');

const COLORS = {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
};

class YesCoinBot {
    constructor() {
        this.accounts = this.loadAccounts('token.txt');
        this.tokens = this.loadTokens('token.json');
        this.cekTaskEnable = true;
        this.upgradeMultiEnable = true;
        this.upgradeFillEnable = true;
        this.maxLevel = 5;
        this.totalCoinsCollected = 0;
        this.totalBalanceAcrossAccounts = 0;
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

    async handleSwipeBot(token) {
        try {
            const accountBuildInfo = await getAccountBuildInfo(token);
            if (accountBuildInfo === null) {
                console.log(`${COLORS.RED}Error: Failed to retrieve SwipeBot information. API returned null.${COLORS.RESET}`);
                return;
            }

            if (accountBuildInfo.code === 0) {
                const { swipeBotLevel, openSwipeBot } = accountBuildInfo.data;
                if (swipeBotLevel < 1) {
                    await upgradeLevel(token, 4);
                    console.log(`${COLORS.GREEN}SwipeBot purchased successfully${COLORS.RESET}`);
                }
                if (swipeBotLevel >= 1 && !openSwipeBot) {
                    await toggleSwipeBotSwitch(token, true);
                    console.log(`${COLORS.GREEN}SwipeBot activated successfully${COLORS.RESET}`);
                }
                if (swipeBotLevel >= 1 && openSwipeBot) {
                    const offlineBonusInfo = await getOfflineYesPacBonusInfo(token);
                    if (offlineBonusInfo === null) {
                        console.log(`${COLORS.RED}Error: Failed to retrieve offline bonus information.${COLORS.RESET}`);
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
                            console.log(`${COLORS.RED}Error: Failed to claim offline bonus. API returned null.${COLORS.RESET}`);
                            return;
                        }
                        if (claimResponse.code === 0) {
                            console.log(`${COLORS.GREEN}Claimed offline bonus successfully, received ${claimResponse.data.collectAmount} coins${COLORS.RESET}`);
                            this.totalCoinsCollected += claimResponse.data.collectAmount;
                        } else {
                            console.log(`${COLORS.RED}Failed to claim offline bonus${COLORS.RESET}`);
                        }
                    }
                }
            } else {
                console.log(`${COLORS.RED}Error: Unexpected response code ${accountBuildInfo.code}${COLORS.RESET}`);
            }
        } catch (error) {
            console.log(`${COLORS.RED}Error handling SwipeBot: ${error.message}${COLORS.RESET}`);
        }
    }

    async main() {
        displayLogo();
        while (true) {
            let totalCoinsThisCycle = 0;
            this.totalBalanceAcrossAccounts = 0;

            for (let i = 0; i < this.accounts.length; i++) {
                const accountIndex = (i + 1).toString();
                const encodedData = this.accounts[i];
                let token;
                try {
                    token = await this.getOrRefreshToken(encodedData, accountIndex);
                } catch (error) {
                    console.log(`${COLORS.RED}Unable to get token for account ${accountIndex}: ${error.message}${COLORS.RESET}`);
                    continue;
                }
                await this.randomDelay();
                await displayAccountInfo(token);
                await displayGameInfo(token);

                await this.randomDelay();
                const squadInfo = await getSquadInfo(token);
                if (squadInfo && squadInfo.data.isJoinSquad) {
                    console.log(`${COLORS.BLUE}You have joined ${squadInfo.data.squadInfo.squadTitle} | ${squadInfo.data.squadInfo.squadMembers} Members${COLORS.RESET}`);
                } else {
                    console.log(`${COLORS.YELLOW}Squad: You are not in a Squad, joining wolvesbase.${COLORS.RESET}`);
                    await this.randomDelay();
                    const joinResult = await joinSquad(token, "t.me/wolvesbase");
                    if (joinResult) {
                        console.log(`${COLORS.GREEN}Squad: Joined Squad successfully!${COLORS.RESET}`);
                    } else {
                        console.log(`${COLORS.RED}Squad: Failed to join Squad!${COLORS.RESET}`);
                    }
                }

                await this.randomDelay();
                console.log(`${COLORS.BLUE}Checking and handling SwipeBot...${COLORS.RESET}`);
                await this.handleSwipeBot(token);

                if (this.cekTaskEnable) {
                    await this.randomDelay();
                    console.log(`${COLORS.BLUE}Starting tasks...${COLORS.RESET}`);
                    const tasks = await getTaskList(token);
                    if (tasks) {
                        for (const task of tasks) {
                            if (task.taskStatus === 0) {
                                await finishTask(token, task.taskId);
                            } else {
                                console.log(`${COLORS.YELLOW}Task already completed${COLORS.RESET}`);
                            }
                        }
                    }
                }

                if (this.upgradeMultiEnable) {
                    await this.randomDelay();
                    console.log(`${COLORS.BLUE}Starting multi upgrade...${COLORS.RESET}`);
                    await upgradeLevel(token, this.maxLevel, '1');
                }

                if (this.upgradeFillEnable) {
                    await this.randomDelay();
                    console.log(`${COLORS.BLUE}Starting Fill Rate upgrade...${COLORS.RESET}`);
                    await upgradeLevel(token, this.maxLevel, '2');
                }

                await this.randomDelay();
                const collectInfo = await getGameInfo(token);
                if (collectInfo === null) {
                    console.log(`${COLORS.RED}Unable to get game data!${COLORS.RESET}`);
                    continue;
                } else {
                    const { singleCoinValue, coinPoolLeftCount } = collectInfo.data;
                    console.log(`${COLORS.BLUE}Energy left ${coinPoolLeftCount}${COLORS.RESET}`);

                    if (coinPoolLeftCount > 0) {
                        await this.randomDelay();
                        const amount = Math.floor(coinPoolLeftCount / singleCoinValue);
                        const collectResult = await collectCoin(token, amount);
                        if (collectResult && collectResult.code === 0) {
                            console.log(`${COLORS.GREEN}Tap successful, received ${collectResult.data.collectAmount} coins${COLORS.RESET}`);
                            totalCoinsThisCycle += collectResult.data.collectAmount;
                        } else {
                            console.log(`${COLORS.RED}Tap unsuccessful!${COLORS.RESET}`);
                        }
                    }
                }

                await this.randomDelay();
                console.log(`${COLORS.BLUE}Checking remaining chests...${COLORS.RESET}`);
                const gameInfo = await getAccountBuildInfo(token);
                if (gameInfo && gameInfo.data.specialBoxLeftRecoveryCount > 0) {
                    if (await useSpecialBox(token)) {
                        await this.randomDelay();
                        console.log(`${COLORS.BLUE}Starting collection...${COLORS.RESET}`);
                        await autoCollectCoins(token, 2, 240);
                    }
                } else {
                    console.log(`${COLORS.YELLOW}No chests available!${COLORS.RESET}`);
                }

                await this.randomDelay();
                console.log(`${COLORS.BLUE}Starting recovery...${COLORS.RESET}`);
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
                                    console.log(`${COLORS.GREEN}Tap successful, received ${collectResult.data.collectAmount} coins${COLORS.RESET}`);
                                    totalCoinsThisCycle += collectResult.data.collectAmount;
                                } else {
                                    console.log(`${COLORS.RED}Tap unsuccessful!${COLORS.RESET}`);
                                }
                            }
                        }
                    }
                } else {
                    console.log(`${COLORS.YELLOW}No more recovery available!${COLORS.RESET}`);
                }

                await this.randomDelay();
                console.log(`${COLORS.BLUE}Checking for free chest...${COLORS.RESET}`);
                await autoCollectCoins(token, 100000, 200);

                const accountInfo = await getAccountInfo(token);
                if (accountInfo && accountInfo.data) {
                    const accountBalance = accountInfo.data.balance;
                    this.totalBalanceAcrossAccounts += accountBalance;
                }
            }

            console.log('==============================================');
            console.log(`${COLORS.YELLOW}Total accounts processed: ${this.accounts.length}${COLORS.RESET}`);
            console.log(`${COLORS.YELLOW}Total balance across all accounts: ${this.totalBalanceAcrossAccounts}${COLORS.RESET}`);
            console.log(`${COLORS.YELLOW}Total coins collected this cycle: ${totalCoinsThisCycle}${COLORS.RESET}`);
            console.log(`${COLORS.YELLOW}Total coins collected overall: ${this.totalCoinsCollected}${COLORS.RESET}`);
            console.log('==============================================');

            console.log(`${COLORS.YELLOW}Waiting for 2 minutes before next cycle...${COLORS.RESET}`);
            await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        }
    }
}

const bot = new YesCoinBot();
bot.main();
