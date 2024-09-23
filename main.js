const fs = require('fs');
const axios = require('axios');
const colors = require('colors');
const { DateTime } = require('luxon');
const { HttpsProxyAgent } = require('https-proxy-agent');

class XPlusApp {
    constructor() {
        this.headers = {
            'authority': 'wonton.food',
            'accept': '*/*',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'content-type': 'application/json',
            'origin': 'https://www.wonton.restaurant',
            'referer': 'https://www.wonton.restaurant/',
            'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        };

 process.stdout.write('\x1Bc');
  console.log('====================================================='.green);
  console.log('                  AIRDROP ASC                        '.green);
  console.log('====================================================='.green);
  console.log('  	  Bot : WONTON	                              '.green);
  console.log('  	  Telegram Channel : @airdropasc		              '.green);
  console.log('  	  Telegram Group : @autosultan_group	            '.green);
  console.log('====================================================='.green);
  console.log();
    }

    async countdown(t) {
        for (let i = t; i > 0; i--) {
            const hours = String(Math.floor(i / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((i % 3600) / 60)).padStart(2, '0');
            const seconds = String(i % 60).padStart(2, '0');
            process.stdout.write(colors.yellow(`[*] Waiting ${hours}:${minutes}:${seconds}     \r`));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        process.stdout.write('                                        \r');
    }

    log(msg, color = 'white') {
        console.log(colors[color](`[*] ${msg}`));
    }

    loadProxies(file) {
        const proxies = fs.readFileSync(file, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        if (proxies.length <= 0) {
            console.log(colors.red(`No proxy found`));
            process.exit();
        }
        return proxies;
    }
    
    async http(url, headers, data = null, proxy = null) {
        try {
            let res;
            const config = { headers };
    
            if (proxy) {
                config.httpAgent = new HttpsProxyAgent(proxy);
                config.httpsAgent = new HttpsProxyAgent(proxy);
            }
    
            if (!data) {
                res = await axios.get(url, config);
            } else if (data === '') {
                res = await axios.post(url, null, config);
            } else {
                res = await axios.post(url, data, config);
            }
            return res;
        } catch (error) {
            this.log('Connection error', 'red');
            throw new Error(error.message);
        }
    }    

    async checkin(token) {
        const url = 'https://wonton.food/api/v1/checkin';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };

        try {
            const res = await this.http(url, headers);
            if (res.status === 200) {
                const data = res.data;
                this.log('Check-in successful!', 'green');
                this.log(`Last check-in date: ${data.lastCheckinDay}`, 'yellow');
                
                if (data.newCheckin) {
                    const reward = data.configs.find(config => config.day === data.lastCheckinDay);
                    if (reward) {
                        this.log(`Daily reward ${data.lastCheckinDay}:`, 'yellow');
                        this.log(`- ${reward.tokenReward} WTON`, 'green');
                        this.log(`- ${reward.ticketReward} ticket`, 'green');
                    }
                } else {
                    this.log('Already check in today', 'yellow');
                }
                
                return data;
            } else {
                this.log(`Cannot check-in. Status code: ${res.status}`, 'red');
                return null;
            }
        } catch (error) {
            this.log(`Error when checking-in: ${error.message}`, 'red');
            return null;
        }
    }
    
    async checkFarmingStatus(token) {
        const url = 'https://wonton.food/api/v1/user/farming-status';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };

        try {
            const res = await this.http(url, headers);
            if (res.status === 200) {
                const data = res.data;
                if (Object.keys(data).length === 0) {
                    return null;
                }
                
                const now = DateTime.now();
                const finishTime = DateTime.fromISO(data.finishAt);
                
                if (now < finishTime) {
                    this.log(`${colors.green('Farming is active. Completion time:')} ${colors.white(finishTime.toFormat('dd/MM/yyyy HH:mm:ss'))}`, 'white');
                    return data;
                } else {
                    return 'claim'; 
                }
            } else {
                this.log(`Unable to check farming status. Status code: ${res.status}`, 'red');
                return null;
            }
        } catch (error) {
            this.log(`Error when checking farming status: ${error.message}`, 'red');
            return null;
        }
    }

    async claimFarming(token) {
        const url = 'https://wonton.food/api/v1/user/farming-claim';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };

        try {
            const res = await this.http(url, headers, {});
            if (res.status === 200) {
                const data = res.data;
                this.log('Successfully received farming reward', 'green');
                return data;
            } else {
                this.log(`Unable to receive farming rewards. Status code: ${res.status}`, 'red');
                return null;
            }
        } catch (error) {
            this.log(`Error receiving farming rewards: ${error.message}`, 'red');
            return null;
        }
    }

    async startFarming(token) {
        const url = 'https://wonton.food/api/v1/user/start-farming';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };

        try {
            const res = await this.http(url, headers, {});
            if (res.status === 200) {
                const data = res.data;
                this.log('Start farming successfully', 'green');
                const finishTime = DateTime.fromISO(data.finishAt).setZone('local');
                this.log(`${colors.green('Farm completion time:')} ${colors.white(finishTime.toFormat('dd/MM/yyyy HH:mm:ss'))}`, 'white');
                return data;
            } else {
                this.log(`Unable to start farming. Status code: ${res.status}`, 'red');
                return null;
            }
        } catch (error) {
            this.log(`Error when starting farming: ${error.message}`, 'red');
            return null;
        }
    }

    async startGame(token) {
        const url = 'https://wonton.food/api/v1/user/start-game';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };
    
        try {
            const res = await this.http(url, headers, {});
            if (res.status === 200) {
                const data = res.data;
                this.log('Start the game successfully', 'green');
                this.log(`Bonus Round: ${data.bonusRound}`, 'yellow');
                return data;
            } else {
                this.log(`Cannot start the game. Status code: ${res.status}`, 'red');
                return null;
            }
        } catch (error) {
            this.log(`Error when starting the game: ${error.message}`, 'red');
            return null;
        }
    }
    
    async finishGame(token, points, hasBonus) {
        const url = 'https://wonton.food/api/v1/user/finish-game';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };
        const data = JSON.stringify({ points, hasBonus });
    
        try {
            const res = await this.http(url, headers, data);
            if (res.status === 200) {
                const responseData = res.data;
    
                this.log('Complete the game successfully', 'green');
                this.log(`${colors.yellow('Get WTON:')} ${colors.white(points)}`, 'white');
                this.log(`${colors.yellow('Bonus:')} ${colors.white(hasBonus)}`, 'white');
    
                if (responseData.items && responseData.items.length > 0) {
                    this.log('You have received the following items:', 'green');
                    responseData.items.forEach(item => {
                        this.log(`${item.name} Farming speed ${item.farmingPower} | ${item.tokenValue} WTON | ${item.value} TON`, 'green');
    
                        if (item.value > 0) {
                            this.saveItemToFile(token, item);
                        }
                    });
                } else {
                    this.log('No items received.', 'yellow');
                }
    
                return responseData;
            } else {
                this.log(`Unable to complete the game. Status code: ${res.status}`, 'red');
                return null;
            }
        } catch (error) {
            this.log(`Error when completing the game: ${error.message}`, 'red');
            return null;
        }
    }    
    
    async getTaskProgress(token) {
        const url = 'https://wonton.food/api/v1/task/claim-progress';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };
    
        try {
            const res = await this.http(url, headers);
            if (res.status === 200) {
                const data = res.data;
                const items = data.items;
    
                this.log(`Claim WONTON successful, received`, 'green');
                items.forEach(item => {
                    this.log(`${item.name} Farming speed ${item.farmingPower} | ${item.tokenValue} WTON | ${item.value} TON`, 'green');
    
                    if (item.value > 0) {
                        this.saveItemToFile(token, item);
                    }
                });
            } else {
                this.log(`Unable to get mission progress. Status code: ${res.status}`, 'red');
            }
        } catch (error) {
            this.log(`Error getting mission progress: ${error.message}`, 'red');
        }
    }    

    async processTasks(token) {
        const url = 'https://wonton.food/api/v1/task/list';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };
    
        try {
            const res = await this.http(url, headers);
            if (res.status === 200) {
                const data = res.data;
                const tasks = data.tasks;
                const taskProgress = data.taskProgress;
    
                for (const task of tasks) {
                    if (task.status === 0) {
                        const claimUrl = 'https://wonton.food/api/v1/task/claim';
                        const claimPayload = {
                            taskId: task.id
                        };
    
                        const claimRes = await this.http(claimUrl, headers, JSON.stringify(claimPayload), 'POST');
                        if (claimRes.status === 200) {
                            this.log(`Do the task: ${task.name}...Status: successful`, 'green');
                        } else {
                            this.log(`Unable to complete the task: ${task.name}. Status code: ${claimRes.status}`, 'red');
                        }
                    }
                }
    
                if (taskProgress >= 3) {
                    await this.getTaskProgress(token);
                }
            } else {
                this.log(`Unable to get task list. Status code: ${res.status}`, 'red');
            }
        } catch (error) {
            this.log(`Error processing task: ${error.message}`, 'red');
        }
    }
    
    saveItemToFile(token, item) {
        const accountId = token.split('|')[0];
        const itemInfo = `Account ${accountId} | ${item.name} Farming speed ${item.farmingPower} | ${item.tokenValue} WTON | ${item.value} TON\n`;
    
        fs.appendFile('check.txt', itemInfo, (err) => {
            if (err) {
                this.log(`Error when saving item to file: ${err.message}`, 'red');
            }
        });
    }    

    async checkProxyIP(proxy) {
        try {
            const proxyAgent = new HttpsProxyAgent(proxy);
            const response = await axios.get('https://api.ipify.org?format=json', {
                httpsAgent: proxyAgent
            });
            if (response.status === 200) {
                return response.data.ip;
            } else {
                throw new Error(`Unable to check proxy IP. Status code: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error checking proxy IP: ${error.message}`.red);
            return null;
        }
    }
    
    async login(data, i, proxy) {
        const url = 'https://wonton.food/api/v1/user/auth';
        const requestData = {
            initData: data,
            inviteCode: ''
        };
    
        try {
            const res = await this.http(url, this.headers, JSON.stringify(requestData), proxy);
            if (res.status !== 200) {
                this.log(`Login failed! Status code: ${res.status}`, 'red');
                return null;
            }
    
            const tokens = res.data.tokens;
            this.saveToken(res.data.user.telegramId, tokens.refreshToken);
    
            const proxyIp = await this.checkProxyIP(proxy);
            if (!proxyIp) {
                this.log('Proxy error, move on to the next account', 'red');
                return null;
            }
    
            let userData = await this.getUserData(tokens.accessToken, proxy);
    
            if (userData) {
                console.log(`Account ${colors.yellow(userData.telegramId)} | ${colors.green(userData.firstName)} | IP: ${colors.cyan(proxyIp)}`);
                this.log(`${colors.blue('WTON Balance:')} ${colors.white(userData.tokenBalance)}`, 'white');
                this.log(`${colors.blue('TON Balance:')} ${colors.white(userData.withdrawableBalance)}`, 'white');
                this.log(`${colors.blue('Ticket Count:')} ${colors.white(res.data.ticketCount)}`, 'white');
    
                await this.checkin(tokens.accessToken, proxy);
    
                const farmingStatus = await this.checkFarmingStatus(tokens.accessToken, proxy);
                if (farmingStatus === null) {
                    await this.startFarming(tokens.accessToken, proxy);
                } else if (farmingStatus === 'claim') {
                    await this.claimFarming(tokens.accessToken, proxy);
                    await this.startFarming(tokens.accessToken, proxy);
                }
    
                if (i === 0 && farmingStatus !== null && farmingStatus !== 'claim') {
                    this.firstFinishTime = DateTime.fromISO(farmingStatus.finishAt);
                }
    
                while (res.data.ticketCount > 0) {
                    const gameData = await this.startGame(tokens.accessToken, proxy);
    
                    if (gameData) {
                        await this.countdown(15);
    
                        const points = Math.floor(Math.random() * (600 - 400 + 1)) + 400;
                        const hasBonus = gameData.bonusRound;
    
                        await this.finishGame(tokens.accessToken, points, hasBonus, proxy);
    
                        userData = await this.getUserData(tokens.accessToken, proxy);
    
                        if (userData) {
                            this.log(`Ticket Count: ${userData.ticketCount}`, 'yellow');
                            res.data.ticketCount = userData.ticketCount;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
    
                if (res.data.ticketCount === 0) {
                    this.log('There are no tickets to play the game!', 'yellow');
                }
    
//                await this.processTasks(tokens.accessToken, proxy);
            }
    
            return tokens.refreshToken;
        } catch (error) {
            this.log(`Error during login process: ${error.message}`, 'red');
            return null;
        }
    }          

    async getUserData(token) {
        const url = 'https://wonton.food/api/v1/user';
        const headers = {
            ...this.headers,
            'Authorization': `bearer ${token}`
        };

        try {
            const res = await this.http(url, headers);
            if (res.status === 200) {
                return res.data;
            } else {
                this.log(`Could not get user data. Status code: ${res.status}`, 'red');
                return null;
            }
        } catch (error) {
            this.log(`Error while retrieving user data: ${error.message}`, 'red');
            return null;
        }
    }

    saveToken(id, token) {
        const tokens = JSON.parse(fs.readFileSync('token.json', 'utf8'));
        tokens[id] = token;
        fs.writeFileSync('token.json', JSON.stringify(tokens, null, 4));
    }

    loadData(file) {
        const datas = fs.readFileSync(file, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    
        if (datas.length <= 0) {
            console.log(colors.red(`No data found`));
            process.exit();
        }
        return datas;
    }

    formatProxy(proxy) {
        // from ip:port:user:pass to http://user:pass@ip:port
        // if http format, just keep it
        if (proxy.startsWith('http')) {
            return proxy;
        }
        const parts = proxy.split(':');
        if (parts.length === 4) {
            return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`
        } else {
            return `http://${parts[0]}:${parts[1]}`;
        }
    }

    async main() {
        const dataFile = 'data.txt';
        const proxyFile = 'proxy.txt';
        const datas = this.loadData(dataFile);
        const proxies = this.loadProxies(proxyFile);
    
        while (true) { 
            this.firstFinishTime = null;
            for (let i = 0; i < datas.length; i++) {
                const data = datas[i];
                const proxyIndex = i % proxies.length;
                const proxy = this.formatProxy(proxies[proxyIndex]);
                await this.login(data, i, proxy);
            }
            if (this.firstFinishTime) {
                const now = DateTime.now();
                const countdownTime = Math.max(0, Math.floor(this.firstFinishTime.diff(now).as('seconds')));
                await this.countdown(countdownTime);
            }
        }
    }    
}

(async () => {
    try {
        if (!fs.existsSync('check.txt')) {
            fs.writeFileSync('check.txt', '');
        }
        if (!fs.existsSync('token.json')) {
            fs.writeFileSync('token.json', '');
            fs.appendFile('token.json', '{}', (err) => {
                if (err) {
                    this.log(`Error when saving item to file: ${err.message}`, 'red');
                }
            });
        }

        const app = new XPlusApp();
        await app.main();
    } catch (error) {
        console.error(colors.red(error));
        process.exit();
    }
})();
