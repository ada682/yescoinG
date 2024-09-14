const axios = require('axios');
const { headers } = require('./headers');

async function login(encodedData) {
    const url = 'https://api-backend.yescoin.gold/user/login';
    const formattedPayload = { code: decodeURIComponent(encodedData) };
    try {
        const response = await axios.post(url, formattedPayload, { headers: headers() });
        if (response.data.code === 0) {
            return response.data.data.token;
        } else {
            throw new Error(`Login failed: ${response.data.message}`);
        }
    } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
}

async function getAccountInfo(token) {
    const url = 'https://api.yescoin.gold/account/getAccountInfo';
    try {
        const response = await axios.get(url, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getGameInfo(token) {
    const url = 'https://api.yescoin.gold/game/getGameInfo';
    try {
        const response = await axios.get(url, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getAccountBuildInfo(token) {
    const url = 'https://api.yescoin.gold/build/getAccountBuildInfo';
    try {
        const response = await axios.get(url, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        } else {
            console.log(`API Error: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching account build info: ${error.message}`);
        return null;
    }
}

async function getSquadInfo(token) {
    const url = 'https://api.yescoin.gold/squad/mySquad';
    try {
        const response = await axios.get(url, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function joinSquad(token, squadLink) {
    const url = 'https://api.yescoin.gold/squad/joinSquad';
    const data = { squadTgLink: squadLink };
    try {
        const response = await axios.post(url, data, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function collectCoin(token, amount) {
    const url = 'https://api.yescoin.gold/game/collectCoin';
    try {
        const response = await axios.post(url, amount, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function useSpecialBox(token) {
    const url = 'https://api.yescoin.gold/game/recoverSpecialBox';
    try {
        const response = await axios.post(url, {}, { headers: headers(token) });
        return response.data.code === 0;
    } catch (error) {
        return false;
    }
}

async function recoverCoinPool(token) {
    const url = 'https://api.yescoin.gold/game/recoverCoinPool';
    try {
        const response = await axios.post(url, {}, { headers: headers(token) });
        return response.data.code === 0;
    } catch (error) {
        return false;
    }
}

async function getTaskList(token) {
    const url = 'https://api.yescoin.gold/task/getCommonTaskList';
    try {
        const response = await axios.get(url, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function finishTask(token, taskId) {
    const url = 'https://api.yescoin.gold/task/finishTask';
    try {
        const response = await axios.post(url, taskId, { headers: headers(token) });
        return response.data.code === 0;
    } catch (error) {
        return false;
    }
}

async function upgradeLevel(token, upgradeType) {
    const url = 'https://api.yescoin.gold/build/levelUp';
    try {
        const response = await axios.post(url, upgradeType, { headers: headers(token) });
        return response.data.code === 0;
    } catch (error) {
        return false;
    }
}

async function getOfflineYesPacBonusInfo(token) {
    const url = 'https://api.yescoin.gold/game/getOfflineYesPacBonusInfo';
    try {
        const response = await axios.get(url, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function claimOfflineBonus(token, claimData) {
    const url = 'https://api.yescoin.gold/game/claimOfflineBonus';
    try {
        const response = await axios.post(url, claimData, { headers: headers(token) });
        if (response.data.code === 0) {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function toggleSwipeBotSwitch(token, status) {
    const url = 'https://api.yescoin.gold/build/toggleSwipeBotSwitch';
    try {
        const response = await axios.post(url, status, { headers: headers(token) });
        return response.data.code === 0;
    } catch (error) {
        return false;
    }
}

module.exports = {
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
};
