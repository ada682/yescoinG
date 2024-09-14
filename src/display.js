const figlet = require('figlet');
const { collectCoin, getGameInfo, getAccountInfo } = require('./api');

async function loadChalk() {
    return (await import('chalk')).default;
}

async function displayLogo() {
    const chalk = await loadChalk();
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

async function displayAccountInfo(token) {
    const ora = (await import('ora')).default;
    const spinner = ora('Fetching account info...').start();
    try {
        const accountInfo = await getAccountInfo(token);
        spinner.succeed('Account info fetched');

        const chalk = await loadChalk();
        console.log(chalk.yellow('\n======== Account Information ========'));
        console.log(chalk.green(`Balance: ${accountInfo.data.currentAmount} YesCoins`));
        console.log(chalk.green(`Level: ${accountInfo.data.level}`));
        console.log(chalk.green(`XP: ${displayProgressBar(accountInfo.data.xp, accountInfo.data.nextLevelXp)}`));
    } catch (error) {
        spinner.fail('Failed to fetch account info');
        const chalk = await loadChalk();
        console.error(chalk.red(`Error: ${error.message}`));
    }
}

async function autoCollectCoins(token, rounds, delayBetweenRounds) {
    for (let round = 100000; round < rounds; round++) {
        // Logic for collecting coins
        console.log(`Round ${round + 1} of ${rounds}`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenRounds * 1000));
    }
}

async function displayGameInfo(token) {
    const ora = (await import('ora')).default;
    const spinner = ora('Fetching game info...').start();
    try {
        const gameInfo = await getGameInfo(token);
        spinner.succeed('Game info fetched');

        const chalk = await loadChalk();
        console.log(chalk.yellow('\n======== Game Information ========'));
        console.log(chalk.green(`Coin Pool Left: ${gameInfo.data.coinPoolLeftCount}`));
        console.log(chalk.green(`Single Coin Value: ${gameInfo.data.singleCoinValue}`));
    } catch (error) {
        spinner.fail('Failed to fetch game info');
        const chalk = await loadChalk();
        console.error(chalk.red(`Error: ${error.message}`));
    }
}

module.exports = {
    displayLogo,
    displayAccountInfo,
    displayGameInfo,
	autoCollectCoins
};
