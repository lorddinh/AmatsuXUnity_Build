window.amatsu = {}
const bigToCommon = (unit, decimals = 0, fixed = 6) => {
  unit = ethers.BigNumber.from(unit)
  if (unit.lte(ethers.BigNumber.from(0)) && unit.gte(ethers.BigNumber.from(-1))) {
      unit = ethers.BigNumber.from(0)
  }
  return (+ethers.utils.formatUnits(unit || 0, decimals || 0) || 0).toFixed(fixed)
}

const numberToCommon = (unit, fixed = 6) => {
  return ethers.utils.commify((+unit || 0).toFixed(fixed))
}

function balanceOf(addr, address, signer) {
  var material = new ethers.Contract(address, window.AmatsuToken.kuni.abi, signer);
  return material.balanceOf(addr);
}

function jsUcfirst(string) 
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}

let provider;
function onEvent() {
  if (provider) {
    
  }
}

function etherUtils() {
  return ethers.utils;
}

function receiveSuccess(data, message) {
  return JSON.stringify({ data, status: true, message })
}

window.ethereum.on('accountsChanged', accounts => { 
  if (accounts.length > 0 && unityInstance) {
    unityInstance.SendMessage('MmRequestLogin', 'Callback', receiveSuccess(accounts[0], 'Account'));
  }
})

function createProvinder() {
  if (!provider) {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    onEvent()
  }

  return provider
}

async function swithNetwork(_chainId) {
  var {chainId} = window.AmatsuToken.network
  try {
    
    if (_chainId !== chainId) {   
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    }
  } catch {
    await addNetwork(chainId)
  }
  
}
async function addNetwork(chainId) {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      ...window.AmatsuToken.network,
      chainId: '0x'+ chainId.toString(16)
    }]
  });
  window.location.reload()
}

var fnApp = {
  onConnect: async function() {
    if (!provider) {
      provider = createProvinder()
    }
    var {chainId} = await provider.getNetwork();
    await swithNetwork(chainId)
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner()
    const account = await signer.getAddress()
    return {
      provider, account, signer, data: JSON.stringify({data: account, status: true, message: 'Accounts'})
    }
  }
}

// KUNI SARU
var fnKuniSaru = {
  checkApproval: async function(owner, operator, token, signer) {
    var contract = new ethers.Contract(token, window.AmatsuToken.kuniSaru.abi, signer);
    const rs = await contract.isApprovedForAll(owner, operator)
    if (!rs) {
      const tx = await contract.setApprovalForAll(operator, true)
      await tx.wait()
    }
    return true
  },
  setApprovalForAll: function(address, signer, operator, approved) {
    var contract = new ethers.Contract(address, Jwindow.AmatsuToken.kuniSaru.abi, signer);
    return contract.setApprovalForAll(operator, approved)
  },
  isApprovedForAll: function(address, signer, owner, operator) {
    var contract = new ethers.Contract(address, window.AmatsuToken.kuniSaru.abi, signer);
    return contract.isApprovedForAll(owner, operator)
  },
  balanceOf: function(addr, token) {
    if (!provider) {
      provider = createProvinder()
    }
    var contract = new ethers.Contract(token, window.AmatsuToken.kuniSaru.abi, provider);
    return new Promise((resolve, reject) => {
      contract.balanceOf(addr)
        .then(rs => resolve(receiveSuccess(ethers.utils.formatUnits(rs, 0))))
        .catch(err => reject(err))
    })
  },
  nftBy: async function(owner, token) {
    if (!provider) {
      provider = createProvinder()
    }
    var contract = new ethers.Contract(token, window.AmatsuToken.kuniSaru.abi, provider);
    var total = await contract.balanceOf(owner)
    var fn = []
    for(var i = 0; i < total; i++) {
      fn.push(contract.tokenOfOwnerByIndex(owner, i))
    }

    return new Promise((resolve, reject) => Promise.all(fn)
      .then(rs => rs.map(i => parseInt(ethers.utils.formatUnits(i, 0))))
      .then(rs => resolve(receiveSuccess(rs, 'nft list')))
      .catch(err => reject(err))
    )
  },
}

var fnEconomyGame = {

}

var fnAmatsu = {
  stake: async function(val) {
    if (!provider) {
      provider = createProvinder()
    }
    const signer = await provider.getSigner()
    
    const owner = await signer.getAddress()
    const kuni = ethers.utils.parseEther(val.split('-')[0])
    const saru = val.split('-')[1].split('_').map(a => parseInt(a))
    console.log(saru);
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, signer)
    var approve = await materialApproval(owner, window.AmatsuToken.amatsu.address, 
      window.AmatsuToken.kuni.address, signer
    )
    approve = await fnKuniSaru.checkApproval(owner, window.AmatsuToken.amatsu.address, window.AmatsuToken.kuniSaru.address, signer)
    return new Promise((resolve, reject) => {
      contract.deposit(kuni, saru)
        .then(() => resolve(receiveSuccess('staked', val)))
        .catch(err => reject(err))
    })
  },
  fighting: async function(val, className, method) {
    try {
      if (!provider) {
        provider = createProvinder()
      }
      
      const signer = await provider.getSigner()
      const owner = await signer.getAddress()
      // const kuni = ethers.utils.parseEther(val.split('-')[0])
      var tokenIds = []
      var itemIds = [];
      val.split('-').forEach(it => {
        var tmp = it.split('+')
        if (tmp.length > 0) {
          tokenIds.push(parseInt(tmp[0]))
        }
        if (tmp.length > 1) {
          var _items = tmp[1].split('_')
          if (_items.length > 0) {
            itemIds.push(_items.map(t => parseInt(t)))
          }
          console.log('itemIds', itemIds);
        }
        
      })
      var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, signer)
      console.log('tokenIds', tokenIds, itemIds);
      const tx = await contract.fighting(tokenIds, itemIds, 1)
      contract.on('Fighting', (user, stage, apKuni, apNioh, win) => {
        if (`${user}`.toLowerCase() == `${owner}`.toLowerCase()) {
          unityInstance.SendMessage(className, method, receiveSuccess(win, 'Event Fighting'));
        }
      })
      await tx.wait()
      return receiveSuccess('fighting', 'fighting')
    } catch ({ message, data }) {
      unityInstance.SendMessage(className, "OnError", (data && data.message) || message);
      return null;
    }
  },
  claim: async function() {
    if (!provider) {
      provider = createProvinder()
    }
    const signer = await provider.getSigner()
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, signer)
    const tx = await contract.claim()
    await tx.wait()
    return receiveSuccess('claim', 'claimed')
  },
  withdraw: async function() {
    if (!provider) {
      provider = createProvinder()
    }
    const signer = await provider.getSigner()
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, signer)
    const tx = await contract.withdraw()
    await tx.wait()
    return receiveSuccess('withdraw', 'vvv')
  },
  craft: async function(val, cType, className, funcName) {
    if (!provider) {
      provider = createProvinder()
    }
    const signer = await provider.getSigner()
    const owner = await signer.getAddress()
    var tokens = []
    var amounts = []
    const rows = val.split('-');
    rows.forEach(it => {
      var vals = it.split('_');
      tokens.push(vals[0])
      amounts.push(ethers.utils.parseEther(vals[1]))
    })
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, signer)
    const tx = await contract.craft(tokens, amounts, parseInt(cType))
    // if (className && method)
    contract.on('Craft', (sender, tokenId) => {
      // event Craft(address indexed user, uint256 indexed tokenId);
      if (`${sender}`.toLowerCase() == `${owner}`.toLowerCase()) {
        unityInstance.SendMessage(className, funcName, receiveSuccess(tokenId.toNumber(), 'Event Craft'));
      }
    })
    await tx.wait()
    return receiveSuccess('Craft success', 'craft')
  },
  getStamina: async function(tokenId) {
    tokenId = ethers.utils.parseUnits(tokenId, 0)
    if (!provider) {
      provider = createProvinder()
    }

    var currentBlock = await provider.getBlockNumber()
    currentBlock = ethers.utils.parseUnits(`${currentBlock}`, 0)
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, provider)
    var stamina = await contract.STAMINA()
    var last = await contract.lastStamina(tokenId)
    if (last.isZero() || currentBlock.sub(last).gte(stamina)) {
      return receiveSuccess(100, 'Stamina')
    }
    let data = (currentBlock.sub(last)).mul(10000).div(stamina);
    return receiveSuccess(data.toNumber()/100, 'Stamina')
  },
  getCurrentCap: async function(sender) {
    if (!provider) {
      provider = createProvinder()
    }
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, provider)
    const val = await contract.currentCap(sender)
    if (val.isZero()) {
      return receiveSuccess(10, 'Current Cap')  
    }
    var div_val = 1e6;
    const rs = val.div(div_val).add(val.mod(div_val).gte(div_val/2) ? 1 : 0)
    return receiveSuccess(rs.toNumber(), 'Current Cap')
  },
  getNftStaked: async function(staker) {
    if (!provider) {
      provider = createProvinder()
    }
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, provider);
    var total = await contract.balanceSaru(staker)
    var fn = []
    for(var i = 0; i < total; i++) {
      fn.push(contract.ownedSaru(staker, i))
    }
    var tokens = await Promise.all(fn);
    return receiveSuccess(tokens.map(t => t.toNumber()), 'nft staked')
  },
  getBonus: async function(staker) {
    if (!provider) {
      provider = createProvinder()
    }
    var contract = new ethers.Contract(window.AmatsuToken.amatsu.address, window.AmatsuToken.amatsu.abi, provider);
    var bonus = await contract.battleBonus(staker)
    return receiveSuccess( bonus.mul(100).div(1e4).toNumber()/100, 'Battle Bonus')
  },
  getItemMeta: async function(tokenId) {
    if (!provider) {
      provider = createProvinder()
    }
    tokenId = ethers.utils.parseUnits(tokenId, 0)
    var contract = new ethers.Contract(window.AmatsuToken.kuniItem.address, window.AmatsuToken.kuniSaru.abi, provider);
    const rs = await contract.getMeta(tokenId)
    const data = {
      cat:    rs.cat.toNumber(),
      name:   rs.name,
      heavy:  ethers.utils.formatUnits(rs.heavy, 0),
      tech:   ethers.utils.formatUnits(rs.tech, 0),
      strike: ethers.utils.formatUnits(rs.strike, 0),
      slash:  ethers.utils.formatUnits(rs.slash, 0),
      magic:  ethers.utils.formatUnits(rs.magic, 0),
    }
    return receiveSuccess(data, 'Item meta')
  }
}

async function materialApproval(owner, spender, token, signer) {
  var contract = new ethers.Contract(token, window.AmatsuToken.kuni.abi, signer);
  const val = await contract.allowance(owner, spender)
  if (val.isZero()) {
    var tx = await contract.approve(spender, ethers.constants.MaxUint256)
    await tx.wait()
  }
  return !(await contract.allowance(owner, spender)).isZero()
}

var fnMaterial = {
  balanceOf: (addr, token) => {
    if (!provider) {
      provider = createProvinder()
    }
    var material = new ethers.Contract(token, AmatsuToken.kuni.abi, provider);
    return material.balanceOf(addr);
  },
  materialApproval,
  approvalAll: async function(owner, spender, addrs, signer) {
    var checkApproval = await Promise.all(addrs.map(token => materialApproval(owner, spender, token, signer)))
    checkApproval.forEach(s => {
      if (!s) return false;
    })
    return true;
  },
  balanceOf: function (addr, token) {
    if (!_provider) {
      if (!provider) {
        provider = createProvinder()
      }
      _provider = provider
    }
    var material = new ethers.Contract(token, window.AmatsuToken.kuni.abi, _provider);
    return material.balanceOf(addr);
  },
  allOf: function(addr, _provider) {
    if (!_provider) {
      if (!provider) {
        provider = createProvinder()
      }
      _provider = provider
    }
    
    let tokens = ['kuni', 'ore', 'stone', 'cotton', 'lumber', 'leather']
    return new Promise(function(resolve, reject) {
      var _abi = window.AmatsuToken.kuni.abi
      var materials = tokens.map(_k => {
        var material = new ethers.Contract(window.AmatsuToken[_k].address, _abi, _provider);
        return material.balanceOf(addr);
      })
      Promise.all(materials)
        .then(rs => rs.map(i => ethers.utils.formatUnits(i, 0)))
        .then(data => {
          const Data = {}
          for (let index = 0; index < tokens.length; index++) {
            Data[tokens[index]] = data[index];
          }
          resolve(JSON.stringify({ data: Data, status: true, message: 'Materials' }))
        })
        .catch(err => reject(err))
    })
  }
}


// kuniPower
window.amatsu = {
  networkId: 97,
  fnApp,
  fnMaterial,
  fnKuniSaru,
  fnAmatsu
}
