let plans = {
    "price_1NIa73LmTOxee3JCz9Vsyrpc": {
        rate: 2, 
        data: 30 * 1000 * 1000 * 1000,
        gb: 30,
        websites: 1,
        network: 'basic'
    },
    "price_1NIaV2LmTOxee3JCsMdW7O4c": {
        rate: 1, 
        data: 50 * 1000 * 1000 * 1000,
        gb: 50,
        websites: 2,
        network: 'basic'
    },
    "price_1NIaX8LmTOxee3JCPG3fZUV9": {
        rate: 1, 
        data: 100 * 1000 * 1000 * 1000,
        gb: 100,
        websites: 5,
        network: 'premium'
    }
};

if (process.env.mode === 'development') plans = {
    "price_1NIabgLmTOxee3JCk1DkIhlY": {
        rate: 2, 
        data: 30 * 1000 * 1000 * 1000,
        gb: 30,
        websites: 1,
        network: 'basic'
    },
    "price_1NIac4LmTOxee3JC8Yq801Qi": {
        rate: 1, 
        data: 50 * 1000 * 1000 * 1000,
        gb: 50,
        websites: 2,
        network: 'basic'
    },
    "price_1NIacFLmTOxee3JCHsxwuqzZ": {
        rate: 1, 
        data: 100 * 1000 * 1000 * 1000,
        gb: 100,
        websites: 5,
        network: 'premium'
    }
};

export default plans;