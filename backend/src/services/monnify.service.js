import axios from "axios";
import api from '../config/api.monnify.config.js'
import config from "../config/env.config.js"

let cachedAccessToken = null

const getAccessToken = async () => {
    try {
        const apiKey = config.MONIFY_API_KEY;
        const secretKey = config.MONIFY_SECRET_KEY;
        const credentials = `${apiKey}:${secretKey}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');
        const response = await axios.post('https://sandbox.monnify.com/api/v1/auth/login', {
        }, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json',
            },
        });
        //console.log(response.data.responseBody)
        if (response.data.responseCode !== '0') throw new Error('authentication failed');
        return response.data
    } catch (error) {
        console.error('Monnify Authentication Failed:', error.response?.data || error.message);
    }
}

const runBackgroundTokenManager = async () => {
    try{
        const accessRes = await getAccessToken()
        cachedAccessToken = accessRes.responseBody.accessToken;
        //console.log(cachedAccessToken)
        setInterval(async () => {
            const refreshToken = await getAccessToken()
            cachedAccessToken = refreshToken.responseBody.accessToken;
            //console.log('newToken')
        }, 3000000) 
    }
    catch (error) {
        console.error (error.message)
    }
}

const fetchAccessToken = async () => {
    if (!cachedAccessToken) {
        await getAccessToken()
    }
    return cachedAccessToken;
}

// Create Monnify reserved account
const createVirtualAccount = async (account_ref, studentName, studentEmail) => {
    try {
        const subAccountId = config.NOMBA_SUB_ACCOUNT_ID
        const res = await api.post(`/api/v2/bank-transfer/reserved-accounts`, {
            accountReference: account_ref,
            accountName: studentName,
            currencyCode: "NGN",
            contractCode: config.MONIFY_CONTRACT_CODE,
            customerEmail: studentEmail,
            //bvn: "21212121444",
            customerName: studentName,
            getAllAvailableBanks: true
        })
        const vaRes = res.data;
        if (vaRes.responseCode !== '0') throw new Error('Virtual account creation failed');
        return vaRes;
    } catch (error) {
        console.error(error.response?.data || error.message)
    }
}

const fetchVirtualAccount = async (identifier) => {
    const res = await api.get(`/v1/accounts/virtual/${identifier}`) // Identifier is account_ref or account number
    console.log(res.data)
    return res.data;
}

const fetchSubAccountTransaction = async (subAccountId) => {
    const res = await api.get(`/v1/transactions/accounts/${subAccountId}/single`) // Identifier is account_ref or account number
    console.log(res.data)
    return res.data;
}

const fetchTransactionHistory = async (accountNumber, dateFrom, dateTo) => {
    const res = await api.get(`/v1/transactions/virtual`, {
        params: {
            virtual_account: accountNumber
            // dateFrom: dateFrom,
            // dateTo: dateTo
        }
    })
    console.log(res.data)
    return res.data;
}
export { runBackgroundTokenManager, fetchAccessToken, createVirtualAccount, fetchVirtualAccount, fetchTransactionHistory, fetchSubAccountTransaction } 