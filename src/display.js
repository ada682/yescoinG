const chalk = require('chalk');
const figlet = require('figlet');
const {
    collectCoin,
    getGameInfo,
    getAccountInfo
} = require('./api');

function displayLogo() {
    console.log(
        chalk.cyan(
            figlet.textSync('YesCoin Bot', { horizontalLayout: 'full' })
        )
    );
    console.log(chalk.blue('t.me/slyntherinnn\n'));
}

function displayProgressBar(current, max, length = 30) {
    const filled = Math.round(current / max * length);
    const empty = length - filled;
    return `[${'='.repeat(filled)}${' '.repeat(empty)}] ${current}/${max}`;
}

async function displayAccountInfo() {
    const ora = (await import('ora')).default;
    const spinner = ora('Fetching account info...').start();
    try {
        const accountInfo = await getAccountInfo();
        spinner.succeed('Account info fetched');
        
        console.log(chalk.yellow('\n======== Account Information ========'));
        console.log(chalk.green(`Balance: ${accountInfo.data.currentAmount} YesCoins`));
        console.log(chalk.green(`Level: ${accountInfo.data.level}`));
        console.log(chalk.green(`XP: ${displayProgressBar(accountInfo.data.xp, accountInfo.data.nextLevelXp)}`));
    } catch (error) {
        spinner.fail('Failed to fetch account info');
        console.error(chalk.red(`Error: ${error.message}`));
    }
}

async function displayGameInfo() {
    const ora = (await import('ora')).default;
    const spinner = ora('Fetching game info...').start();
    try {
        const gameInfo = await getGameInfo();
        spinner.succeed('Game info fetched');
        
        console.log(chalk.yellow('\n======== Game Information ========'));
        console.log(chalk.green(`Coin Pool Left: ${gameInfo.data.coinPoolLeftCount}`));
        console.log(chalk.green(`Single Coin Value: ${gameInfo.data.singleCoinValue}`));
    } catch (error) {
        spinner.fail('Failed to fetch game info');
        console.error(chalk.red(`Error: ${error.message}`));
    }
}

async function autoCollectCoins(interval, count) {
    console.log(chalk.yellow(`\n======== Auto Coin Collection ========`));
    console.log(chalk.cyan(`Target: ${count} coins`));
    
    let collected = 0;
    const ora = (await import('ora')).default;
    const spinner = ora('Collecting coins...').start();
    
    const collectInterval = setInterval(async () => {
        if (collected >= count) {
            clearInterval(collectInterval);
            spinner.succeed(chalk.green(`Finished collecting ${count} coins.`));
            return;
        }
        try {
            await collectCoin();
            collected++;
            spinner.text = `Collected ${collected}/${count} coins`;
        } catch (error) {
            console.error(chalk.red(`Error collecting coin: ${error.message}`));
        }
    }, interval);
}

async function autoCollectCoinsInBatches(interval, batchSizes) {
    console.log(chalk.yellow(`\n======== Batch Coin Collection ========`));
    let totalCollected = 0;
    const ora = (await import('ora')).default;

    for (const batchSize of batchSizes) {
        console.log(chalk.cyan(`Starting batch for collecting ${batchSize} coins...`));
        const spinner = ora('Collecting coins...').start();

        for (let collected = 0; collected < batchSize; collected++) {
            try {
                await collectCoin();
                totalCollected++;
                spinner.text = `Collected ${collected + 1}/${batchSize} in current batch`;
                await new Promise(resolve => setTimeout(resolve, interval));
            } catch (error) {
                console.error(chalk.red(`Error collecting coin: ${error.message}`));
            }
        }

        spinner.succeed(chalk.green(`Batch for collecting ${batchSize} coins complete.`));
    }

    console.log(chalk.green(`\nFinished collecting a total of ${totalCollected} coins across all batches.`));
}

function displayLevelUp(oldLevel, newLevel) {
    console.log(chalk.yellow('\n======== Level Up! ========'));
    console.log(chalk.magenta(figlet.textSync(`${oldLevel} → ${newLevel}`, { font: 'Small' })));
    console.log(chalk.green('Congratulations! You\'ve reached a new level!'));
}

module.exports = {
    displayLogo,
    displayAccountInfo,
    displayGameInfo,
    autoCollectCoins,
    autoCollectCoinsInBatches,
    displayLevelUp
};
