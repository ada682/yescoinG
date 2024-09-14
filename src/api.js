const axios = require('axios');
const fs = require('fs');
const { getStoredToken, setToken } = require('./headers');

let axiosInstance = null;

function setupAxios(token) {
    axiosInstance = axios.create({
        baseURL: 'https://api-backend.yescoin.gold',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.yescoin.gold',
            'Referer': 'https://www.yescoin.gold/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
        }
    });

    if (token) {
        axiosInstance.defaults.headers['token'] = token;
    }
}

async function loginWithTelegramApi(telegramAuthData) {
    try {
        console.log('[INFO] Data sent to YesCoin for login:', telegramAuthData);

        // Format the id to be a string or simple number (if the API expects a string)
        const loginPayload = {
            id: telegramAuthData.id.toString(),  // Convert BigInt to string
            first_name: telegramAuthData.first_name,
            username: telegramAuthData.username
        };

        const apiBaseUrl = 'https://api-backend.yescoin.gold'; // Base URL for YesCoin API
        const response = await axios.post(`${apiBaseUrl}/user/login`, loginPayload);
        console.log("Response from YesCoin:", response.data);

        // Check if the response contains a token
        if (response.data && response.data.token) {
            setToken(response.data.token);
            setupAxios(response.data.token);
        } else {
            console.error("Token not found in response:", response.data);
        }
    } catch (error) {
        console.error('Error during YesCoin login:', error.message);
    }
}

async function getUserInfo() {
    try {
        const response = await axiosInstance.get('/user/info');
        console.log('User info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting user info:', error.message);
        throw error;
    }
}

async function collectCoin() {
    try {
        const response = await axiosInstance.post('/game/collectCoin');
        console.log('Coin collected:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error collecting coin:', error.message);
        throw error;
    }
}

async function getCommonTaskList() {
    try {
        const response = await axiosInstance.get('/task/getCommonTaskList');
        console.log('Common task list:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting common task list:', error.message);
        throw error;
    }
}

async function finishTask(taskId) {
    try {
        const response = await axiosInstance.post('/task/finishTask', { taskId });
        console.log('Task finished:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error finishing task:', error.message);
        throw error;
    }
}

async function getGameInfo() {
    try {
        const response = await axiosInstance.get('/game/getGameInfo');
        console.log('Game info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting game info:', error.message);
        throw error;
    }
}

async function getAccountInfo() {
    try {
        const response = await axiosInstance.get('/account/getAccountInfo');
        console.log('Account info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting account info:', error.message);
        throw error;
    }
}

async function specialBoxReloadPage() {
    try {
        const response = await axiosInstance.post('/game/specialBoxReloadPage');
        console.log('Special box reloaded:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error reloading special box:', error.message);
        throw error;
    }
}

async function getSpecialBoxInfo() {
    try {
        const response = await axiosInstance.get('/game/getSpecialBoxInfo');
        console.log('Special box info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting special box info:', error.message);
        throw error;
    }
}

async function collectSpecialBoxCoin() {
    try {
        const response = await axiosInstance.post('/game/collectSpecialBoxCoin');
        console.log('Special box coin collected:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error collecting special box coin:', error.message);
        throw error;
    }
}

async function getWallet() {
    try {
        const response = await axiosInstance.get('/wallet/getWallet');
        console.log('Wallet info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting wallet info:', error.message);
        throw error;
    }
}

async function login(loginData) {
    try {
        const response = await axiosInstance.post('/user/login', loginData);
        console.log('Login successful:', response.data);
        if (response.data.token) {
            setToken(response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error.message);
        throw error;
    }
}

async function getSkinList() {
    try {
        const response = await axiosInstance.get('/skin/getSkinList');
        console.log('Skin list:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting skin list:', error.message);
        throw error;
    }
}

async function getAccountBuildInfo() {
    try {
        const response = await axiosInstance.get('/build/getAccountBuildInfo');
        console.log('Account build info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting account build info:', error.message);
        throw error;
    }
}

async function getBuildItem() {
    try {
        const response = await axiosInstance.get('/tgStar/getBuildItem');
        console.log('Build item info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting build item info:', error.message);
        throw error;
    }
}

async function getOfflineYesPacBonusInfo() {
    try {
        const response = await axiosInstance.get('/game/getOfflineYesPacBonusInfo');
        console.log('Offline YesPac bonus info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting offline YesPac bonus info:', error.message);
        throw error;
    }
}

async function finishDailyMission(missionData) {
    try {
        const response = await axiosInstance.post('/mission/finishDailyMission', missionData);
        console.log('Daily mission finished:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error finishing daily mission:', error.message);
        throw error;
    }
}

module.exports = {
    setupAxios,
    loginWithTelegramApi,
    getUserInfo,
    collectCoin,
    getCommonTaskList,
    finishTask,
    getGameInfo,
    getAccountInfo,
    specialBoxReloadPage,
    getSpecialBoxInfo,
    collectSpecialBoxCoin,
    getWallet,
    login,
    getSkinList,
    getAccountBuildInfo,
    getBuildItem,
    getOfflineYesPacBonusInfo,
    finishDailyMission
};
