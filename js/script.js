async function getCSVDataFirst() {
    try {
        const responses = await Promise.all(urlsCSVDataFirst.map(url => fetch(url)));
        let index = 0; // Biến đếm để đánh số các phần tử
        const csvDataArray = await Promise.all(responses.map(response => {
            if (!response.ok) {
                throw fileNamesCSVDataFirst[index]; // Ném exception với tên của file lỗi
            }
            index++; // Tăng biến đếm sau mỗi lần lặp
            return response.text();
        }));

        const resultsArray = await Promise.all(csvDataArray.map(csvData => Papa.parse(csvData, {
            header: true,
            // Cấu hình khác (nếu có) ...
        })));

        resultsArray.forEach((results, index) => {
            const nameCSV = fileNamesCSVDataFirst[index]; // Đặt tên cho biến nameCSV dựa trên tên tệp CSV
            addDataForSessionStorage('tempCSV', nameCSV, results.data); // Dữ liệu JSON đã được chuyển đổi cho từng URL
        });
    } catch (error) {
        console.error("Lỗi khi nhận data CSV");
    }
}

getCSVDataFirst();
/////////////// Làm mới info avatar liên tục
// Hàm để gọi fetch và xử lý dữ liệu
function fetch_data_block_now() {
  // addToLog("Thử lấy block now và avg")
  fetch(urlBlockNow)
    .then(function(response) {
      if (!response.ok) {
        throw ($.i18n("showNotification-fetchDataBlockNow-error") + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      if (data.hasOwnProperty("message")) {
        var errorMessage = data.message;
        throw errorMessage;
      }
      return data;
    })
    .then(function(data) {
      // Chuyển đổi đối tượng JSON thành một mảng
      var blockNowArray = [];
      blockNowArray.push(data);
      var _temp = JSON.stringify(data);
      localStorage.setItem("blockNowJson", _temp);
      // addToLog("Hoàn thành lấy block now và avg")
    })
    .catch(function(error) {
      addToLog("lỗi khi lấy block now và avg: " + error);
      showNotification(error, "error", showNotification_timeShow);
      localStorage.removeItem("blockNowJson");
      return;
    });
}

function delayUseNode() {
  var delayUseNode1 = document.getElementById("delayUseNode");
  var delayUseNode;
  if (delayUseNode1 === null) {
    showNotification($.i18n("showNotification-delayUseNode") + delayUseNode_default / 1000 + "s", "info", delayUseNode_default);
  } else {
    delayUseNode = parseInt(delayUseNode1.value) * 1000; // Chuyển đổi đơn vị giây thành mili-giây
    showNotification($.i18n("showNotification-delayUseNode") + parseInt(delayUseNode1.value) + "s", "info", delayUseNode);
  }

  console.log("Thời gian delay node: " + delayUseNode);
  return new Promise((resolve) => setTimeout(resolve, delayUseNode));
}

var timerFetchDataAvatar;

function fetchDataAvatar() {
  console.log("Bắt đầu fetch avatar");
  showNotification($.i18n("showNotification-fetchDataAvatar-getData"), "alert", showNotification_timeShow);
  var submitBtn = $("#submit_login_form");
  submitBtn.addClass("disabled");
  submitBtn.html($.i18n("lobby-login-submit-button-logged-in"));
  submitBtn.prop("disabled", true);
  $(".needReplaceTrans-autoRefresh").prop("disabled", true);
  Promise.all([getArmorIDandSTT(), fetchDataAvatar_useNode(), checkYourServer(), checkDonaterBlock(), fetchTicketArena(), fetchPatrolReward()])
    .then(() => {
      console.log("Kết thúc fetch avatar");
      submitBtn.removeClass("disabled");
      submitBtn.html($.i18n("lobby-login-submit-button"));
      submitBtn.prop("disabled", false);
      $(".needReplaceTrans-autoRefresh").prop("disabled", false);
      tryUseNode_All();
    })
    .catch((error) => {
      console.log("Đã xảy ra lỗi trong quá trình fetch avatar:", error);
      submitBtn.removeClass("disabled");
      submitBtn.html($.i18n("lobby-login-submit-button"));
      submitBtn.prop("disabled", false);
      $(".needReplaceTrans-autoRefresh").prop("disabled", false);
    });
  timerFetchDataAvatar = setTimeout(fetchDataAvatar, timerFetchDataAvatar_setTimeout);
}

function fetchDataAvatarAgain() {
  // Hủy định thời gian chờ hiện tại (nếu có)
  clearTimeout(timerFetchDataAvatar);

  // Gọi lại hàm fetchDataAvatar()
  fetchDataAvatar();

}

function tryUseNode_All() {
  if ($("#continueUseNodeCheckbox").prop("checked")) {
    var patrolRewardInfo = getDataFromSessionStorage("session_login9cmd", "patrolRewardInfo");
    if (patrolRewardInfo !== null) {
      let lastClaimedAt = patrolRewardInfo.lastClaimedAt;
      let lastClaimedTime = new Date(lastClaimedAt);
      let timeNow = Math.floor((Date.now() - lastClaimedTime) / 1000);
      let remainingSeconds = secondWaitRewardPatrol - timeNow;
      if (remainingSeconds <= 0) {
        tryUseNode_claimPatrolReward();
      }
    }
  }
}

// Lấy name, level, ncg, cryslat, AP và time AP
async function fetchDataAvatar_useNode() {
  console.log("fetchDataAvatar_useNode start");
  var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
  var avatarAddress = getDataFromSessionStorage("session_login9cmd", "avatarAddress");
  var url_rpc = getDataFromSessionStorage("session_login9cmd", "url_rpc");
  if (url_rpc === null) {
    console.log("Thiếu url rpc");
    showNotification($.i18n("showNotification-fetchDataAvatarUseNode-urlRPC-warning"), "warning", showNotification_timeShow);
    return;
  }
  try {
    showNotification($.i18n("showNotification-fetchDataAvatarUseNode-urlRPC-info"), "info", showNotification_timeShow);
    var post_data_json = {
      query: `query{stateQuery{stakeStates(addresses:"${Address9c}"){deposit}agent(address:"${Address9c}"){gold crystal}avatar(avatarAddress:"${avatarAddress}"){address actionPoint level dailyRewardReceivedIndex name stageMap{pairs count}runes{runeId level}inventory{consumables{grade id itemType itemSubType elementalType requiredBlockIndex itemId mainStat}materials{grade id itemType itemSubType elementalType requiredBlockIndex itemId}costumes{grade id itemType itemSubType elementalType requiredBlockIndex itemId equipped}equipments{grade id itemType itemSubType elementalType requiredBlockIndex setId stat{statType baseValue totalValue additionalValue}equipped itemId level exp skills{id elementalType power chance statPowerRatio referencedStatType}buffSkills{id elementalType power chance statPowerRatio referencedStatType}statsMap{hP aTK dEF cRI hIT sPD}}}itemMap{count pairs}}}}`,
    };
    await delayUseNode();
    var response = await fetch(url_rpc, {
      method: "POST",
      body: JSON.stringify(post_data_json),
      headers: {
        "Content-Type": "application/json",
      },
    });

    var apiResponse = await response.json();

    if (apiResponse && apiResponse.data && apiResponse.data.stateQuery) {} else if (apiResponse && apiResponse.errors && apiResponse.errors[0].message) {
      throw apiResponse.errors[0].message;
    } else {
      throw $.i18n("showNotification-fetchDataAvatarUseNode-apiResponse-error");
    }

    // Lưu dữ liệu avatar info
    var avatarInfo = JSON.parse(sessionStorage.getItem("session_login9cmd")) || {};

    if (apiResponse.data.stateQuery.stakeStates[0] !== null) {
      var ncgStake = Math.floor(apiResponse.data.stateQuery.stakeStates[0].deposit);
      avatarInfo.ncgStake = ncgStake;

      if (ncgStake < ncgStake5AP) {
        avatarInfo.APBaseOnStake = 5;
      } else if (ncgStake < ncgStake4AP) {
        avatarInfo.APBaseOnStake = 4;
      } else {
        avatarInfo.APBaseOnStake = 3;
      }
    } else {
      avatarInfo.ncgStake = null;
      avatarInfo.APBaseOnStake = 5;
    }

    if (apiResponse.data.stateQuery.avatar.runes.length) {
      avatarInfo.runes = apiResponse.data.stateQuery.avatar.runes;
    } else {
      avatarInfo.runes = null;
    }

    avatarInfo.name = apiResponse.data.stateQuery.avatar.name;
    avatarInfo.level = apiResponse.data.stateQuery.avatar.level;
    avatarInfo.gold = parseFloat(apiResponse.data.stateQuery.agent.gold);
    avatarInfo.crystal = Math.floor(parseFloat(apiResponse.data.stateQuery.agent.crystal));
    avatarInfo.actionPoint = apiResponse.data.stateQuery.avatar.actionPoint;
    avatarInfo.dailyRewardReceivedIndex = apiResponse.data.stateQuery.avatar.dailyRewardReceivedIndex;
    // Bỏ qua stage của mimisbrunnr

    let count = 0;
    let array = apiResponse.data.stateQuery.avatar.stageMap.pairs;
    for (let i = 0; i < array.length; i++) {
      const subArray = array[i];

      if (!subArray[0].toString().startsWith("100000")) {
        count++;
      }
    }
    avatarInfo.passStage = count;

    // Lưu lại dữ liệu trang bị
    avatarInfo.dataEquipments = generateDataEquipments(apiResponse.data.stateQuery.avatar.inventory.equipments);

    sessionStorage.setItem("session_login9cmd", JSON.stringify(avatarInfo));
  } catch (error) {
    console.error(error);
    delDataFromSessionStorage("session_login9cmd", "name");
    delDataFromSessionStorage("session_login9cmd", "level");
    delDataFromSessionStorage("session_login9cmd", "gold");
    delDataFromSessionStorage("session_login9cmd", "crystal");
    delDataFromSessionStorage("session_login9cmd", "actionPoint");
    delDataFromSessionStorage("session_login9cmd", "dailyRewardReceivedIndex");
    delDataFromSessionStorage("session_login9cmd", "passStage");
    delDataFromSessionStorage("session_login9cmd", "ncgStake");
    delDataFromSessionStorage("session_login9cmd", "dataEquipments");
    showNotification($.i18n("showNotification-fetchDataAvatarUseNode-catch-error") + error, "error", showNotification_timeShow);
    return error;
  }
}

async function getArmorIDandSTT() {
  console.log("getArmorIDandSTT start");
  var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
  var avatarAddress2 = getDataFromSessionStorage("session_login9cmd", "avatarAddress");
  if (Address9c === null || avatarAddress2 === null) {
    return;
  }
  var avatarAddress = avatarAddress2.toLowerCase();
  var url = url9cscanApi + "/account?address=" + Address9c;
  var avatarDCC;
  // Lấy dữ liệu DCC
  const apiDCCData = await fetch(urlAllAvatarHaveDCC);

  if (!apiDCCData.ok) {
    avatarDCC = 0;
  } else {
    const dccData = await apiDCCData.json();
    for (const key in dccData.avatars) {
      if (key.toLowerCase() === avatarAddress) {
        avatarDCC = dccData.avatars[key];
        break; // Thoát khỏi vòng lặp khi tìm thấy khớp
      }
    }
    if (!avatarDCC) {
      avatarDCC = 0;
    }
  }

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 404) {
        throw $.i18n("showNotification-getArmorIDandSTT-throw-error-1");
      } else {
        throw ($.i18n("showNotification-getArmorIDandSTT-throw-error-2") + response.status);
      }
    })
    .then((data) => {
      if (Array.isArray(data) && data.length === 0) {
        throw $.i18n("showNotification-getArmorIDandSTT-throw-error-3");
      } else {
        return data; // Trả về dữ liệu
      }
    })
    .then(function(apiData) {
      var matchingAvatar = apiData.find(function(item) {
        return item.avatarAddress.toLowerCase() === avatarAddress;
      });

      if (matchingAvatar) {
        var stt = apiData.indexOf(matchingAvatar) + 1;
        var armorId = armorId_normal; // ID mặc định
        // Kiểm tra xem mảng equipments có tồn tại hay không
        if (!matchingAvatar.avatar.inventory || matchingAvatar.avatar.inventory.equipments.length === 0) {
          var armorEquipment = false;
        } else {
          // Tìm trong mảng equipments để tìm giá trị id của "itemSubType": "ARMOR"
          var armorEquipment = matchingAvatar.avatar.inventory.equipments.find(function(equipment) {
            return equipment.itemSubType === "ARMOR";
          });


          if (armorEquipment) {
            armorId = armorEquipment.id;
          }
        }
        if (avatarDCC !== 0) {
          armorId = avatarDCC;
        }
        addDataForSessionStorage("session_login9cmd", "armorId", armorId);
        addDataForSessionStorage("session_login9cmd", "stt", stt);
      }
    })
    .catch(function(error) {
      console.log(error);
      delDataFromSessionStorage("session_login9cmd", "armorId");
      delDataFromSessionStorage("session_login9cmd", "stt");
      showNotification($.i18n("showNotification-fetchDataAvatarUseNode-catch-error") + error, "error", showNotification_timeShow);
      return error;
    });
}

async function checkDonaterBlock() {
  console.log("checkDonaterBlock start");

  var donater = getDataFromSessionStorage("session_login9cmd", "donater");
  if (donater) {
    var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
    var Address9cLower = Address9c.toLowerCase();
    fetch(nineCMDapi + "/statusDonater?agentAddress=" + Address9cLower)
      .then(function(response) {
        if (!response.ok) {
          throw $.i18n("nineCMDapi-checkDonaterBlock-error-1", response.status);
        }
        return response.json();
      })
      .then(function(data) {
        if (data.length === 0) {
          throw $.i18n("nineCMDapi-checkDonaterBlock-error-2");
        }
		if (data[0].blockEnd > data[0].blockTry) {
			addDataForSessionStorage("session_login9cmd", "donaterBlock", data[0].blockEnd);
			addDataForSessionStorage("tempNineCMD", "isDonater", true);
			addDataForSessionStorage("tempNineCMD", "isTryDonater", false);
		} else {
			addDataForSessionStorage("session_login9cmd", "donaterBlock", data[0].blockTry);
			addDataForSessionStorage("tempNineCMD", "isDonater", true);
			addDataForSessionStorage("tempNineCMD", "isTryDonater", true);
		}
      })
      .catch(function(error) {
        delDataFromSessionStorage("session_login9cmd", "donaterBlock");
		delDataFromSessionStorage("tempNineCMD", "isDonater");
		delDataFromSessionStorage("tempNineCMD", "isTryDonater");
        console.log(error);
        return error;
      });
  }
}

async function fetchTicketArena() {
  try {
    console.log("fetchTicketArena start");
    const user = getDataFromSessionStorage("session_login9cmd", "avatarAddress");
    if (user === null) {
      return;
    }
    const response = await fetch(urlArenaData);

    const data = await response.json();

    if (data.length === 0) {
      throw $.i18n("_9capi-fetchTicketArena-error-1");
    } else {
      const foundUser = data.find((item) => item.avataraddress.toLowerCase() === user.toLowerCase());

      if (!foundUser) {
        throw $.i18n("_9capi-fetchTicketArena-error-2");
      }

      const currentTickets = foundUser.currenttickets;
      addDataForSessionStorage("session_login9cmd", "ticketArena", currentTickets);
    }
  } catch (error) {
    delDataFromSessionStorage("session_login9cmd", "ticketArena");
    console.log("Lỗi khi nhận ticket Arena " + error);
  }
}
async function fetchPatrolReward() {
  console.log("fetchPatrolReward start");
  var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
  var avatarAddress = getDataFromSessionStorage("session_login9cmd", "avatarAddress");

  try {
    var post_data_json = {
      query: `mutation {
        putAvatar(agentAddress: "${Address9c}", avatarAddress: "${avatarAddress}") {
          agentAddress
          avatarAddress
          claimCount
          createdAt
          lastClaimedAt
          level
        }
      }`
    };
    let url = urlProxy_default + "/" + urlPatrolGraphql;
    var response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(post_data_json),
      headers: {
        "Content-Type": "application/json",
      },
    });

    var apiResponse = await response.json();
    if (apiResponse && apiResponse.data && apiResponse.data.putAvatar) {
      let level = apiResponse.data.putAvatar.level;
      let filteredPolicies = patrolRewardPolicy.filter(policy => level >= policy.level);
      let maxLevelMax = Math.max(...filteredPolicies.map(policy => policy.level));
      let selectedPolicy = patrolRewardPolicy.find(policy => policy.level === maxLevelMax);
      if (selectedPolicy) {
        let temp = {
          claimCount: apiResponse.data.putAvatar.claimCount,
          lastClaimedAt: apiResponse.data.putAvatar.lastClaimedAt,
          crystal: selectedPolicy.crystal,
          silverDust: selectedPolicy.silverDust
        };
        addDataForSessionStorage("session_login9cmd", "patrolRewardInfo", temp);
      } else {
        throw $.i18n("showNotification-fetchPatrolReward-apiResponse-error-1");
      }
    } else if (apiResponse && apiResponse.errors && apiResponse.errors[0].message) {
      throw apiResponse.errors[0].message;
    } else {
      throw $.i18n("showNotification-fetchPatrolReward-apiResponse-error-2");
    }
  } catch (error) {
    delDataFromSessionStorage("session_login9cmd", "patrolRewardInfo");
    console.log("Lỗi khi nhận thông tin Patrol Reward " + error);
  }
}
async function checkYourServer() {
  console.log("checkYourServer start");
  // Ktra server và mật khẩu bằng cách lấy public Key
  var url_Server = getDataFromSessionStorage("session_login9cmd", "url_Server");
  if (url_Server !== null) {
	var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
	var password = getDataFromSessionStorage("session_login9cmd", "password");
    // var passwordServer = getDataFromSessionStorage("session_login9cmd", "passwordServer");
    try {
      var post_data_json = {
		"agentAddress": Address9c,
		"password": password,
		"locale": $.i18n().locale
      };
      let url = "//" + url_Server + "/publicKey";
      var response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(post_data_json),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
		addDataForSessionStorage("tempNineCMD", "serverOk", false);
		delDataFromSessionStorage("tempNineCMD", "hasUTCFile");  
		throw "Request to server failed: " + response.status + " " + response.statusText;
      }
      var apiResponse = await response.json();
      if (apiResponse.error == 0) {
		addDataForSessionStorage("tempNineCMD", "hasUTCFile", true);
		addDataForSessionStorage("tempNineCMD", "passwordOk", true);
		addDataForSessionStorage("tempNineCMD", "serverOk", true);
		addDataForSessionStorage("session_login9cmd", "publicKey", apiResponse.message);
		delDataFromSessionStorage("tempNineCMD", "errorYourServer");
		console.log("Nhận public key ok");
      } else if ((apiResponse.error == 10001) || (apiResponse.error == 10002)) {
		addDataForSessionStorage("tempNineCMD", "hasUTCFile", false);  
		addDataForSessionStorage("tempNineCMD", "serverOk", true);
		throw apiResponse.message;
	  } else {
		delDataFromSessionStorage("tempNineCMD", "hasUTCFile");  
		addDataForSessionStorage("tempNineCMD", "serverOk", true);
		throw apiResponse.message;
	  }
    } catch (error) {
      console.log(error);
	  delDataFromSessionStorage("tempNineCMD", "passwordOk");
	  addDataForSessionStorage("tempNineCMD", "errorYourServer", error);
	  delDataFromSessionStorage("session_login9cmd", "publicKey");
	  showNotification(error, 'error', showNotification_timeShow);
    }
  }
}

async function fetchCSVname() {
  try {
	  let nameCSV = "item_name"
    const csvUrl = `https://raw.githubusercontent.com/planetarium/NineChronicles/${pathNineChronicles}/nekoyume/Assets/StreamingAssets/Localization/${nameCSV}.csv`;
    const response = await fetch(csvUrl);
    if (!response.ok) {
		  const csvUrl = `csv/${nameCSV}.csv`;
  const response = await fetch(csvUrl);
  if (!response.ok) {  
      throw $.i18n("apiGithubNineChronicles-fetchCSVname-error-1", response.status);
}  
  }
    const csvData = await response.text();
    processDataCSVName(csvData);
    await fetchCSVLevelReq();
  } catch (error) {
    // Xử lý lỗi khi tải tệp CSV
    console.error(error);
  }
}
async function fetchCSVLevelReq() {
	let locale = $.i18n().locale
	let nameCSV = "ItemRequirementSheet"
  const csvUrl = `${nineCMDapi}/get9cBoardCSV?network=${network9cBoard}&csv=${nameCSV}&locale=${locale}`;
  const response = await fetch(csvUrl);
	if (!response.ok) {
		  const csvUrl = `csv/${nameCSV}.csv`;
  const response = await fetch(csvUrl);
  if (!response.ok) {  
      throw $.i18n("apiGithubNineChronicles-fetchCSVname-error-1", response.status);
}  
  }  
  const csvData = await response.text();
  processDataCSVLevelReq(csvData);
}

function getDataFromCSV(data, searchKey, item_id, labels) {
  const item = data.find(item => item[searchKey] === item_id.toString());
  
  if (item) {
    const reversedLabels = {};
    for (const key in labels) {
      reversedLabels[key] = item[labels[key]];
    }
    return reversedLabels;
  } else {
    return {};
  }
}

function generateDataEquipments(input) {
  const itemReqCSV = getDataFromSessionStorage('tempCSV', 'ItemRequirementSheet');
  const itemNameCSV = getDataFromSessionStorage('tempCSV', 'item_name');
  
  return input.map((item, index) => {	  
    const itemId = item.id;
	
	var dataCSV = itemReqCSV;
	var searchKey = "item_id";
	var labels = {level_req: "level", mimis_req: "mimislevel"};
	const itemReqCSVconvert = getDataFromCSV(dataCSV, searchKey, itemId, labels);
	console.log(itemReqCSVconvert);
	var dataCSV = itemNameCSV;
	var searchKey = "Key";
	var labels = {name: langCSV_default[$.i18n().locale]};
	const itemNameCSVconvert = getDataFromCSV(dataCSV, searchKey, "ITEM_NAME_" + itemId, labels);
	console.log(itemNameCSVconvert);
    const skills = item.skills && item.skills.length > 0 ? item.skills[0] : null;
    const skillsData = skills ? {
      skillId: skills.id,
      skillChance: skills.chance,
      skillElementalType: skills.elementalType,
      skillPower: skills.power,
      skillReferencedStatType: skills.referencedStatType,
      skillStatPowerRatio: skills.statPowerRatio
    } : null;


    const output = {
      stt: index + 1,
      name: itemNameCSVconvert.name || "Unknown", // Thêm trường "name" từ dataCSV hoặc một giá trị mặc định "Unknown" nếu không tồn tại
      level_req: itemReqCSVconvert.level_req || level_req_default, // Thêm trường "level_req" từ dataCSV hoặc một giá trị mặc định 0 nếu không tồn tại
      mimislevel: itemReqCSVconvert.mimislevel || mimislevels_default,
      image: `https://raw.githubusercontent.com/planetarium/NineChronicles/${pathNineChronicles}/nekoyume/Assets/Resources/UI/Icons/Item/${itemId}.png`,
      id: itemId,
      itemType: item.itemType,
      itemSubType: item.itemSubType,
      elementalType: item.elementalType,
      requiredBlockIndex: item.requiredBlockIndex,
      setId: item.setId,
      level: item.level,
      grade: item.grade,
      exp: item.exp,
      CP: (item.skills !== [] ? Math.round((item.statsMap.hP * mathCP['hP'] + item.statsMap.aTK * mathCP['aTK'] + item.statsMap.dEF * mathCP['dEF'] + item.statsMap.sPD * mathCP['sPD'] + item.statsMap.hIT * mathCP['hIT']) * mathCP['hasSkill']) : Math.round(item.statsMap.hP * mathCP['hP'] + item.statsMap.aTK * mathCP['aTK'] + item.statsMap.dEF * mathCP['dEF'] + item.statsMap.sPD * mathCP['sPD'] + item.statsMap.hIT * mathCP['hIT'])),
      elementalTypeId: item.elementalType === "WIND" ? 4 : item.elementalType === "LAND" ? 3 : item.elementalType === "WATER" ? 2 : item.elementalType === "FIRE" ? 1 : 0,
      elementalTypeImg: item.elementalType === "NORMAL" ? "https://raw.githubusercontent.com/planetarium/NineChronicles/" + pathNineChronicles + "/nekoyume/Assets/Resources/UI/Icons/ElementalType/icon_element_normal.png" : `https://raw.githubusercontent.com/planetarium/NineChronicles/${pathNineChronicles}/nekoyume/Assets/Resources/UI/Icons/ElementalType/icon_elemental_${item.elementalType.toLowerCase()}.png`,
      itemId: item.itemId,
      statsMap: item.statsMap,
      skills: skillsData,
      equipped: item.equipped,
      stat: item.stat,
    };

    return output;
  });
}
/////////////////// Vẽ lobby
// bar custom
var CustomProgressBar = function(settings) {
  var self = this;

  self.element = settings.element;
  self.imageUrl = settings.imageUrl;
  self.backgroundImageUrl = settings.backgroundImageUrl || settings.imageUrl;
  self.imageHeight = settings.imageHeight;
  self.imageWidth = settings.imageWidth;
  if (settings.backgroundOpacity || settings.backgroundOpacity === 0) {
    self.backgroundOpacity = settings.backgroundOpacity;
  } else {
    self.backgroundOpacity = 0.3;
  }

  $(self.element).prepend($("<div>", {
    class: "custom-progress-bar",
    style: "height: " + self.imageHeight + "px; width: " + self.imageHeight + "px;"
  }));
  $(self.element)
    .children(".custom-progress-bar")
    .prepend($("<div>", {
      class: "cpb-progress"
    }));
  $(self.element)
    .children(".custom-progress-bar")
    .prepend($("<div>", {
      class: "cpb-background"
    }));
  $(self.element)
    .find(".cpb-background")
    .prepend($("<img/>", {
      style: "opacity: " + self.backgroundOpacity + ";",
      class: "custom-background-image",
      src: self.backgroundImageUrl
    }));
  $(self.element)
    .find(".cpb-progress")
    .prepend($("<img/>", {
      class: "custom-progress-image",
      src: self.imageUrl
    }));

  self.setPercentage = function(value) {
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    var toShowAmount = (settings.imageHeight / 100) * value;
    var toHideAmount = (settings.imageHeight / 100) * (100 - value);

    // Thêm transition mượt vào cpb-progress
    $(self.element)
      .find(".cpb-progress")
      .css({
        height: toShowAmount + "px",
        top: toHideAmount + "px",
        transition: "height 0.5s ease-in, top 0.5s ease-in, height 0.5s ease-out, top 0.5s ease-out",
      });
  };
};

$.fn.customProgressBar = function(settings) {
  settings.element = $(this);
  var newProgressBar = new CustomProgressBar(settings);
  return newProgressBar;
};
//
function SimulateProgress(customProgressBar, currentValue) {
  var increase = getRandomInt(0, 3);
  var newValue = currentValue + increase;
  if (newValue > 100) newValue = 100;
  if (currentValue == 100) newValue = 0;
  customProgressBar.setPercentage(newValue);
  setTimeout(function() {
    SimulateProgress(customProgressBar, newValue);
  }, 200);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//
function updateAPBar(typeBar) {
  var blockNow = getDataFromLocalStorage("blockNowJson", "block");
  var dailyRewardReceivedIndex = getDataFromSessionStorage("session_login9cmd", "dailyRewardReceivedIndex");
  if (blockNow === null || dailyRewardReceivedIndex === null) {
    typeBar.setPercentage(0);
    $(".lobby-AP-bar-view-3 span").numberAnimate("set", "----");
    let _temp = document.getElementsByClassName("lobby-loading-vip-2 lobby-AP-bar-view-6");
    _temp[0].style.display = "block";
    let _temp2 = document.getElementsByClassName("lobby-AP-bar-view-7");
    _temp2[0].style.display = "none";
    $(".lobby-AP-bar-view").removeClass("zoom-in-out");
  } else {
    var block = blockNow - dailyRewardReceivedIndex;
    var percentage = (block / 1700) * 100;
    if (percentage > 100) percentage = 100;
    typeBar.setPercentage(percentage);
    $(".lobby-AP-bar-view-3 span").numberAnimate("set", block);
    let _temp2 = document.getElementsByClassName("lobby-loading-vip-2 lobby-AP-bar-view-6");
    _temp2[0].style.display = "none";
    if (percentage == 100) {
      let _temp2 = document.getElementsByClassName("lobby-AP-bar-view-7");
      _temp2[0].style.display = "block";
      $(".lobby-AP-bar-view").addClass("zoom-in-out");
    } else {
      let _temp2 = document.getElementsByClassName("lobby-AP-bar-view-7");
      _temp2[0].style.display = "none";
      $(".lobby-AP-bar-view").removeClass("zoom-in-out");
    }
  }

  setTimeout(function() {
    updateAPBar(typeBar);
  }, customProgressBar_setTimeout);
}

function updatetaskUseNodeBar(typeBar) {
  var taskPercentageNow = getDataFromSessionStorage("tempNineCMD", "taskUseNodePercentageNow");
  if (taskPercentageNow === null) {
    typeBar.setPercentage(0);
  } else {
    typeBar.setPercentage(taskPercentageNow);
  }
  setTimeout(function() {
    updatetaskUseNodeBar(typeBar);
  }, customProgressBar_setTimeout);
}

function updateAPBar2(typeBar) {
  var actionPoint = getDataFromSessionStorage("session_login9cmd", "actionPoint");
  if (actionPoint === null) {
    typeBar.setPercentage(0);
    $(".lobby-AP-bar-2-view-3 span").numberAnimate("set", "---");
    let _temp = document.getElementsByClassName("lobby-loading-vip-2 lobby-AP-bar-2-view-4");
    _temp[0].style.display = "block";
  } else {
    let percentage = (actionPoint / 120) * 100;
    typeBar.setPercentage(percentage);
    $(".lobby-AP-bar-2-view-3 span").numberAnimate("set", actionPoint);
    let _temp = document.getElementsByClassName("lobby-loading-vip-2 lobby-AP-bar-2-view-4");
    _temp[0].style.display = "none";
  }

  setTimeout(function() {
    updateAPBar2(typeBar);
  }, customProgressBar_setTimeout);
}

function updatePatrolBar(typeBar) {
  var patrolRewardInfo = getDataFromSessionStorage("session_login9cmd", "patrolRewardInfo");
  var spansTimePatrol = $(".lobby-patrol-view-8 span");
  var _temp2 = document.getElementsByClassName("lobby-patrol-view-7");
  _temp2[0].style.display = "block";
  if (patrolRewardInfo !== null) {
    let lastClaimedAt = patrolRewardInfo.lastClaimedAt;
    let lastClaimedTime = new Date(lastClaimedAt);
    let timeNow = Math.floor((Date.now() - lastClaimedTime) / 1000);
    let remainingSeconds = secondWaitRewardPatrol - timeNow;
    let hours = Math.floor(remainingSeconds / 3600);
    let minutes = Math.floor((remainingSeconds % 3600) / 60);
    let seconds = remainingSeconds % 60;

    $(".lobby_patrolReward_modal_5_6").text(patrolRewardInfo.crystal);
    $(".lobby_patrolReward_modal_5_7").text(patrolRewardInfo.silverDust);
    $(".lobby_patrolReward_modal_6 span").eq(0).text(Math.floor(timeNow / 3600));
    $(".lobby_patrolReward_modal_6 span").eq(1).text(Math.floor((timeNow % 3600) / 60));
    $(".lobby_patrolReward_modal_5_9_1").text($.i18n("lobby-patrol-claim-button", hours, minutes));
    spansTimePatrol.eq(0).numberAnimate("set", hours);
    spansTimePatrol.eq(1).numberAnimate("set", minutes);
    spansTimePatrol.eq(2).numberAnimate("set", seconds);

    _temp2[0].style.display = "none";
    if (remainingSeconds <= 0) {
      typeBar.setPercentage(100);
      $(".lobby_patrolReward_modal_5_9_1").prop("disabled", false);
      $(".lobby_patrolReward_modal_5_9_1").removeClass("disabled");
      $(".lobby-patrol-view").addClass("zoom-in-out");
      $(".lobby-patrol-view-2").css("filter", "brightness(1)");
      $(".lobby-patrol-view-4").hide();
      $(".lobby-patrol-view-6").show();
    } else {
      let percentage = (timeNow / secondWaitRewardPatrol) * 100;
      typeBar.setPercentage(percentage);
      $(".lobby_patrolReward_modal_5_9_1").prop("disabled", true);
      $(".lobby_patrolReward_modal_5_9_1").addClass("disabled");
      $(".lobby-patrol-view").removeClass("zoom-in-out");
      $(".lobby-patrol-view-2").css("filter", "brightness(0.5)");
      $(".lobby-patrol-view-4").show();
      $(".lobby-patrol-view-6").hide();
    }
  } else {
    typeBar.setPercentage(0);
    $(".lobby_patrolReward_modal_5_9_1").prop("disabled", true);
    $(".lobby_patrolReward_modal_5_9_1").addClass("disabled");
    $(".lobby_patrolReward_modal_5_6").text("----");
    $(".lobby_patrolReward_modal_5_7").text("--");
    spansTimePatrol.eq(0).numberAnimate("set", "--");
    spansTimePatrol.eq(1).numberAnimate("set", "--");
    spansTimePatrol.eq(2).numberAnimate("set", "--");
    $(".lobby-patrol-view").removeClass("zoom-in-out");
    $(".lobby-patrol-view-2").css("filter", "brightness(1)");
    $(".lobby-patrol-view-4").hide();
    $(".lobby-patrol-view-6").hide();
    _temp2[0].style.display = "block";
  }

  setTimeout(function() {
    updatePatrolBar(typeBar);
  }, customProgressBar_setTimeout);
}

function updateTurnSweep_range() {
  var actionPoint = getDataFromSessionStorage("session_login9cmd", "actionPoint");
  var APBaseOnStake = getDataFromSessionStorage("session_login9cmd", "APBaseOnStake");
  if (APBaseOnStake === null) APBaseOnStake = 5;
  if (actionPoint === null) actionPoint = 0;
  var turnSweep_range = document.getElementById("turnSweep_range");
  var turnSweep_number1 = document.getElementById("turnSweep_number1");
  var turnSweep_number2 = document.getElementById("turnSweep_number2");
  // Update the step attribute of the turnSweep_range input
  turnSweep_range.step = APBaseOnStake;
  // Disable turnSweep_range beyond the specified limit
  if (turnSweep_range.value > actionPoint) {
    turnSweep_range.value = actionPoint;
  }
  turnSweep_number1.textContent = turnSweep_range.value / APBaseOnStake;
  turnSweep_number2.textContent = actionPoint / APBaseOnStake;
}

function fetchDataAvatar_display() {
  var avatarAddress = getDataFromSessionStorage("session_login9cmd", "avatarAddress");
  var actionPoint = getDataFromSessionStorage("session_login9cmd", "actionPoint");
  var armorId = getDataFromSessionStorage("session_login9cmd", "armorId");
  var crystal = getDataFromSessionStorage("session_login9cmd", "crystal");
  var dailyRewardReceivedIndex = getDataFromSessionStorage("session_login9cmd", "dailyRewardReceivedIndex");
  var donaterBlock = getDataFromSessionStorage("session_login9cmd", "donaterBlock");
  var gold = getDataFromSessionStorage("session_login9cmd", "gold");
  var level = getDataFromSessionStorage("session_login9cmd", "level");
  var name = getDataFromSessionStorage("session_login9cmd", "name");
  var url_rpc = getDataFromSessionStorage("session_login9cmd", "url_rpc");
  var ticketArena = getDataFromSessionStorage("session_login9cmd", "ticketArena");
  var passStage = getDataFromSessionStorage("session_login9cmd", "passStage");
  var ncgStake = getDataFromSessionStorage("session_login9cmd", "ncgStake");
  var APBaseOnStake = getDataFromSessionStorage("session_login9cmd", "APBaseOnStake");

  var delayUseNode = parseInt(document.getElementById("delayUseNode").value);

  var lobbyLoadingVipElements = document.getElementsByClassName("lobby-loading-vip");

  for (var i = 0; i < lobbyLoadingVipElements.length; i++) {
    lobbyLoadingVipElements[i].style.display = "block";
  }

  // $("#radioStagesweep_fixed span").text(APBaseOnStake);

  var _temp2 = document.getElementsByClassName("lobby-loading-vip image-avatar");
  if (armorId !== null) {
    if (armorId < armorId_normal) {
      $(".lobby-armorId-view").attr("src", "https://raw.githubusercontent.com/planetarium/NineChronicles/" + pathNineChronicles + "/nekoyume/Assets/Resources/PFP/" + armorId + ".png");
      $(".lobby-frame-view").attr("src", "assets/img/Common/UI_Common/character_frame_dcc_mod.png");
    } else {
      $(".lobby-armorId-view").attr("src", "https://raw.githubusercontent.com/planetarium/NineChronicles/" + pathNineChronicles_armorId + "/nekoyume/Assets/Resources/UI/Icons/Item/" + armorId + ".png");
      $(".lobby-frame-view").attr("src", "assets/img/Common/UI_Common/character_frame_mod.png");
    }
    _temp2[0].style.display = "none";
  } else {
    $(".lobby-armorId-view").attr("src", "assets/img/Common/UI_Common/" + armorId_normal + ".png");
    $(".lobby-frame-view").attr("src", "assets/img/Common/UI_Common/character_frame_mod.png");
    _temp2[0].style.display = "block";
  }
  if (level !== null) {
    $(".lobby-level-view span").numberAnimate("set", level);
    _temp2[0].style.display = "none";
  } else {
    $(".lobby-level-view span").numberAnimate("set", "---");
    _temp2[0].style.display = "block";
  }
  if (!(name === null)) {
    $(".lobby-name-view").html(name + "<span class='text-muted' style='font-size: 0.7em;letter-spacing: 1px;'> #" + avatarAddress.substring(2, 6) + "</span>");
    _temp2[0].style.display = "none";
  } else {
    $(".lobby-name-view").text("No data name");
    _temp2[0].style.display = "block";
  }

  if (crystal !== null) {
    $(".lobby-crystal-bar-view-3 span").numberAnimate("set", crystal.toLocaleString("en-US"));
    var _temp2 = document.getElementsByClassName("lobby-loading-vip lobby-crystal-bar-view-4");
    _temp2[0].style.display = "none";
  } else {
    $(".lobby-crystal-bar-view-3 span").numberAnimate("set", "------");
  }

  if (gold !== null) {
    $(".lobby-NCG-bar-view-3 span").numberAnimate("set", gold.toLocaleString("en-US"));
    var _temp2 = document.getElementsByClassName("lobby-loading-vip lobby-NCG-bar-view-4");
    _temp2[0].style.display = "none";
  } else {
    $(".lobby-NCG-bar-view-3 span").numberAnimate("set", "------");
  }

  if (ticketArena !== null) {
    // $('.lobby-arena-view-2 span').numberAnimate('set', ticketArena);
    $(".lobby-arena-view-ticket1 span").text(ticketArena);
    var _temp2 = document.getElementsByClassName("lobby-loading-vip lobby-arena-view-ticket2");
    _temp2[0].style.display = "none";
  } else {
    // $('.lobby-arena-view-2 span').numberAnimate('set', "-");
    $(".lobby-arena-view-ticket1 span").text("");
  }


  if (passStage !== null) {
    $("#radioStagesweep_label span").text(passStage);
  } else {
    $("#radioStagesweep_label span").text("999");
  }

  var blockNow = getDataFromLocalStorage("blockNowJson", "block");

  var spansTimeArena = $(".lobby-arena-view-4 span");
  var spansTableBlockNow = $(".lobby-table-block-now-view span");

  if (blockNow === null) {
    showNotification($.i18n("showNotification-fetchDataAvatarDisplay-blockNow-error"), "error", showNotification_timeShow);
    spansTimeArena.eq(0).numberAnimate("set", "----");
    spansTimeArena.eq(1).numberAnimate("set", "--");
    spansTimeArena.eq(2).numberAnimate("set", "--");
    spansTimeArena.eq(3).numberAnimate("set", "--");
    spansTimeArena.eq(4).numberAnimate("set", "--");

    spansTableBlockNow.eq(0).numberAnimate("set", "--------");
    spansTableBlockNow.eq(1).numberAnimate("set", "---");
    spansTableBlockNow.eq(3).text(url_rpc);
    spansTableBlockNow.eq(2).numberAnimate("set", delayUseNode);
  } else {
    var avgBlock = getDataFromLocalStorage("blockNowJson", "avgBlock");
    var timeBlockArena = getDataFromLocalStorage("blockNowJson", "timeBlock");
    var roundID = getDataFromLocalStorage("blockNowJson", "roundID");
    var h_arena = getDataFromLocalStorage("blockNowJson", "h");
    var m_arena = getDataFromLocalStorage("blockNowJson", "m");
    var s_arena = getDataFromLocalStorage("blockNowJson", "s");

    spansTimeArena.eq(0).numberAnimate("set", timeBlockArena);
    spansTimeArena.eq(1).numberAnimate("set", h_arena);
    spansTimeArena.eq(2).numberAnimate("set", m_arena);
    spansTimeArena.eq(3).numberAnimate("set", s_arena);
    spansTimeArena.eq(4).numberAnimate("set", roundID);

    spansTableBlockNow.eq(0).numberAnimate("set", blockNow.toLocaleString("en-US"));
    spansTableBlockNow.eq(1).numberAnimate("set", avgBlock);
    spansTableBlockNow.eq(3).text(url_rpc);
    spansTableBlockNow.eq(2).numberAnimate("set", delayUseNode);
    if (donaterBlock !== null) {
	  let isTry = getDataFromSessionStorage("tempNineCMD", "isTryDonater");
	  if (!getDataFromSessionStorage("tempNineCMD", "isTryDonater")) {
		  let backgroundColor = "forestgreen"
		  $(".lobby-donater-view").css("background-color", backgroundColor);
	  } else {
		  let backgroundColor = "goldenrod"
		  $(".lobby-donater-view").css("background-color", backgroundColor);
	  }
      $(".lobby-donater-view span").numberAnimate("set", (donaterBlock - blockNow).toLocaleString("en-US"));
	  
    } else {
      $(".lobby-donater-view span").numberAnimate("set", "------");
	  let backgroundColor = "slategray";
	  $(".lobby-donater-view").css("background-color", backgroundColor);
    }

    if (dailyRewardReceivedIndex !== null) {
      // Tính toán số giây
      let seconds_2 = (dailyRewardReceivedIndex - blockNow + 1700) * avgBlock;
      let seconds = Math.abs(seconds_2);
      // Chuyển đổi thành giờ, phút, giây hoặc ngày, giờ
      let hours = Math.floor(seconds / 3600);
      let minutes = Math.floor((seconds % 3600) / 60);
      let remainingSeconds = seconds % 60;

      $(".lobby-AP-bar-view-5 span").eq(0).numberAnimate("set", hours);
      $(".lobby-AP-bar-view-5 span").eq(1).numberAnimate("set", minutes);
    } else {
      $(".lobby-AP-bar-view-5 span").eq(0).numberAnimate("set", "--");
      $(".lobby-AP-bar-view-5 span").eq(1).numberAnimate("set", "--");
    }
  }

  // Bảng Task use node manager
  $(".spanActionPotionText").text(actionPoint);
  $(".spanAPBaseOnStakeText").text(APBaseOnStake);
  canAutoListItems();
  setTimeout(function() {
    fetchDataAvatar_display();
  }, fetchDataAvatar_display_setTimeout);
}

function addDataForLocalStorage(parentKey, childKey, data) {
  // Kiểm tra xem Local Storage có tồn tại hay không
  if (typeof Storage !== "undefined") {
    // Lấy dữ liệu từ Local Storage (nếu có)
    var localStorageData = localStorage.getItem(parentKey);

    // Kiểm tra và chuyển đổi dữ liệu từ JSON thành đối tượng JavaScript
    var parsedData = localStorageData ? JSON.parse(localStorageData) : {};

    // Thêm dữ liệu mới vào đối tượng JavaScript
    parsedData[childKey] = data;

    // Chuyển đổi đối tượng JavaScript thành JSON
    var updatedData = JSON.stringify(parsedData);

    // Lưu dữ liệu vào Local Storage
    localStorage.setItem(parentKey, updatedData);
  } else {
    console.log("Trình duyệt của bạn không hỗ trợ Local Storage.");
  }
}

function getDataFromLocalStorage(parentKey, childKey) {
  // Kiểm tra xem Local Storage có tồn tại hay không
  if (typeof Storage !== "undefined") {
    // Lấy dữ liệu từ Local Storage (nếu có)
    var localStorageData = localStorage.getItem(parentKey);

    // Kiểm tra và chuyển đổi dữ liệu từ JSON thành đối tượng JavaScript
    var parsedData = localStorageData ? JSON.parse(localStorageData) : {};

    // Trả về dữ liệu theo childKey (nếu tồn tại)
    if (parsedData.hasOwnProperty(childKey) && parsedData[childKey] !== "") {
      return parsedData[childKey];
    } else {
      return null; // Trả về null nếu childKey không tồn tại trong dữ liệu
    }
  } else {
    console.log("Trình duyệt của bạn không hỗ trợ Local Storage.");
    return null; // Trình duyệt không hỗ trợ Local Storage, trả về null
  }
}

function delDataFromLocalStorage(parentKey, childKey) {
  var parentData = localStorage.getItem(parentKey);
  if (parentData) {
    var parsedData = JSON.parse(parentData);

    if (parsedData.hasOwnProperty(childKey)) {
      delete parsedData[childKey];
      localStorage.setItem(parentKey, JSON.stringify(parsedData));
      console.log("Đã xóa dữ liệu con '" + childKey + "' trong dữ liệu cha '" + parentKey + "'.");
    } else {
      console.log("Dữ liệu con '" + childKey + "' không tồn tại trong dữ liệu cha '" + parentKey + "'.");
    }
  } else {
    console.log("Dữ liệu cha '" + parentKey + "' không tồn tại trong localStorage.");
  }
}

function addDataForSessionStorage(parentKey, childKey, data) {
  // Kiểm tra xem sessionStorage có tồn tại hay không
  if (typeof sessionStorage !== "undefined") {
    // Lấy dữ liệu từ sessionStorage (nếu có)
    var sessionStorageData = sessionStorage.getItem(parentKey);

    // Kiểm tra và chuyển đổi dữ liệu từ JSON thành đối tượng JavaScript
    var parsedData = sessionStorageData ? JSON.parse(sessionStorageData) : {};

    // Thêm dữ liệu mới vào đối tượng JavaScript
    parsedData[childKey] = data;

    // Chuyển đổi đối tượng JavaScript thành JSON
    var updatedData = JSON.stringify(parsedData);

    // Lưu dữ liệu vào sessionStorage
    sessionStorage.setItem(parentKey, updatedData);
  } else {
    console.log("Trình duyệt của bạn không hỗ trợ sessionStorage.");
  }
}

function getDataFromSessionStorage(parentKey, childKey) {
  // Kiểm tra xem sessionStorage có tồn tại hay không
  if (typeof sessionStorage !== "undefined") {
    // Lấy dữ liệu từ sessionStorage (nếu có)
    var sessionStorageData = sessionStorage.getItem(parentKey);

    // Kiểm tra và chuyển đổi dữ liệu từ JSON thành đối tượng JavaScript
    var parsedData = sessionStorageData ? JSON.parse(sessionStorageData) : {};

    // Trả về dữ liệu theo childKey (nếu tồn tại)
    if (parsedData.hasOwnProperty(childKey) && parsedData[childKey] !== "") {
      return parsedData[childKey];
    } else {
      return null; // Trả về null nếu childKey không tồn tại trong dữ liệu
    }
  } else {
    console.log("Trình duyệt của bạn không hỗ trợ sessionStorage.");
    return null; // Trình duyệt không hỗ trợ sessionStorage, trả về null
  }
}

function delDataFromSessionStorage(parentKey, childKey) {
  var parentData = sessionStorage.getItem(parentKey);
  if (parentData) {
    var parsedData = JSON.parse(parentData);

    if (parsedData.hasOwnProperty(childKey)) {
      delete parsedData[childKey];
      sessionStorage.setItem(parentKey, JSON.stringify(parsedData));
      console.log("Đã xóa dữ liệu con '" + childKey + "' trong dữ liệu cha '" + parentKey + "'.");
    } else {
      console.log("Dữ liệu con '" + childKey + "' không tồn tại trong dữ liệu cha '" + parentKey + "'.");
    }
  } else {
    console.log("Dữ liệu cha '" + parentKey + "' không tồn tại trong sessionStorage.");
  }
}

// Lưu trữ trạng thái hiện tại của cửa sổ
var isWindowVisible = true;

//////////// Lưu lại log
function addToLog(message) {
  var log = localStorage.getItem("log");
  var timestamp = new Date().toLocaleString();
  var logEntry = timestamp + ": " + message;

  if (log) {
    log += "\n" + logEntry;
  } else {
    log = logEntry;
  }

  localStorage.setItem("log", log);
  console.log(logEntry);
}

// Gọi hàm addToLog để thêm thông điệp vào log
// addToLog('Tiến trình bắt đầu');
// ...
// addToLog('Tiến trình hoàn thành');

// Để truy cập và hiển thị log
// var log = localStorage.getItem('log');
// console.log(log);

//////////// Xóa thông báo khi ẩn trang xuống taskbar
// Đăng ký sự kiện visibilitychange
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "hidden") {
    // Cửa sổ đang ẩn, ẩn thông báo
    isWindowVisible = false;
    Noty.closeAll(); // Đóng tất cả thông báo
  } else if (document.visibilityState === "visible") {
    // Cửa sổ được mở lại, hiển thị thông báo nếu có
    isWindowVisible = true;
  }
});

function showNotification(message, type, time) {
  if (isWindowVisible) {
    var icon = ""; // Biến để lưu biểu tượng tương ứng với loại thông báo

    // Đặt biểu tượng dựa trên loại thông báo
    switch (type) {
      case "alert":
        icon = "bi-chat-text-fill";
        break;
      case "success":
        icon = "bi-check-circle-fill";
        break;
      case "warning":
        icon = "bi-exclamation-triangle-fill";
        break;
      case "error":
        icon = "bi-bug-fill";
        break;
      case "info":
        icon = "bi-info-circle-fill";
        break;
      default:
        icon = "bi-chat-text-fill";
        break;
    }

    new Noty({
      text: '<i class="' + icon + '"></i> ' + message, // Thêm biểu tượng vào nội dung thông báo
      type: type,
      layout: "bottomLeft",
      timeout: time,
      theme: "mint",
      // closeWith: ["button", "click"],
      closeWith: ["click"],
      progressBar: true,
      // container: ".noty_lobby",
    }).show();
  }
}
//alert, success, warning, error, info/information

/////////// Lưu info avatarAddress
// Biến toàn cục để lưu trữ dữ liệu từ form
// var _9cmd_form_data_login = {};

// Hàm để lưu dữ liệu vào Local Storage
function save_9cmd_form_data_login() {
  var Address9c = document.getElementById("Address9c").value;
  var avatarAddress = document.getElementById("avatarSelect").value;
  var password = document.getElementById("password").value;
  var is_donater = document.getElementById("is-donater").checked;
  var url_rpc = document.getElementById("url_rpc").value;
  var url_Server = document.getElementById("url_server_python").value;
  // var passwordServer = document.getElementById("passwordServer").value;

  // if (url_rpc.startsWith("http://")) {
  // Sử dụng proxy khi url_rpc bắt đầu bằng "http://"
  // url_rpc = urlProxy_default + "/" + url_rpc;
  // }

  var _9cmd_form_data_login = {
    Address9c: Address9c,
    avatarAddress: avatarAddress,
    password: password,
    donater: is_donater,
    url_rpc: url_rpc,
    url_Server: url_Server,
    // passwordServer: passwordServer,
  };
  var _temp = JSON.stringify(_9cmd_form_data_login);
  addToLog("Lưu lại _9cmd_form_data_login:" + _temp);
  localStorage.setItem("_9cmd_form_data_login", _temp);
  sessionStorage.setItem("session_login9cmd", _temp);
}
//////////// Gợi ý hiển thị lại những giá trị đã lưu khi tải trang
window.addEventListener("load", function() {
  populateFormWithSavedData();
});
//////////// Hàm để gợi ý hiển thị lại những giá trị đã lưu
function populateFormWithSavedData() {
  var savedData = localStorage.getItem("_9cmd_form_data_login");
  addToLog("Thử sử dụng dữ liệu đã lưu _9cmd_form_data_login");
  if (savedData) {
    addToLog("Dữ liệu đã lưu _9cmd_form_data_login:" + savedData);
    var _9cmd_form_data_login_json = JSON.parse(savedData);
    document.getElementById("Address9c").value = _9cmd_form_data_login_json.Address9c;
    // Hiển thị trường avatarSelect
    document.getElementById("avatarSelect2").style.display = "block";
    document.getElementById("avatarSelect").value = _9cmd_form_data_login_json.avatarAddress;
    var $option = $("<option>").text(_9cmd_form_data_login_json.avatarAddress).val(_9cmd_form_data_login_json.avatarAddress);
    $("#avatarSelect").append($option);
    document.getElementById("password").value = _9cmd_form_data_login_json.password;
    document.getElementById("is-donater").checked = _9cmd_form_data_login_json.donater;
    document.getElementById("url_rpc").value = _9cmd_form_data_login_json.url_rpc;
    document.getElementById("url_server_python").value = _9cmd_form_data_login_json.url_Server;
    // document.getElementById("passwordServer").value = _9cmd_form_data_login_json.passwordServer;
  }
}

/////////// Nhận lệnh button_lobby
document.addEventListener("DOMContentLoaded", function() {
  var buttons = document.getElementsByClassName("button_lobby");

  var modals = {
    login: $(".lobby_login_modal"),
    inventory: $(".lobby_inventory"),
    comments: $(".lobby_comment"),
    managerUseNode: $(".lobby_manager_use_node_modal"),
    arena: $(".lobby_arena_modal"),
    patrol: $(".lobby_patrolReward_modal"),
    // Thêm các modal khác nếu cần
  };

  var modalCreatTable = {
    inventory: true,
  };

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function() {
      var action = this.getAttribute("data-action");

      if (modals[action]) {
        toggleModal(modals[action], modalCreatTable[action] == true);
      }
    });
  }

  function toggleModal(modal, booleanTable) {
    if (modal.is(":hidden")) {
      $(".lobby_hide_modal").fadeOut(fadeOut_timeShow);
      modal.fadeIn(fadeIn_timeShow); // Hiển thị modal với hiệu ứng fade-in trong 300ms
      if (booleanTable) {
        creatTableInventory();
      }

    } else {
      modal.fadeOut(fadeOut_timeShow); // Ẩn modal với hiệu ứng fade-out trong 300ms
      if (booleanTable) {
        $('.table-inventory').bootstrapTable('destroy');
      }
    }
  }
});

/////////////// Hàm chọn node từ link api rpc
function node_list_error(error) {
  addToLog("Lỗi khi load data rpc " + error);
  node_list_default.forEach(function(item) {
    var optionText = item.name + " • " + item.rpc;
    var optionValue = item.url;
    var option = $("<option>").text(optionText).attr("value", optionValue);
    $("#url_rpc").append(option);
  });
}

function node_list(data) {
  addToLog("Duyệt qua từng dữ liệu RPC");

  data.forEach(function(item) {
    if ((item.active === "True") & item.url.startsWith("https://")) {
      var optionText = item.name + " • Diff " + item.difference + " • Response " + item.response_time_seconds + "s •  Users " + item.users;
      var optionValue = item.url;
      // if (optionValue.startsWith("http://")) {
      // Sử dụng proxy khi optionValue bắt đầu bằng "http://"
      // optionValue = urlProxy_default + "/" + optionValue;
      // }
      var option = $("<option>").text(optionText).attr("value", optionValue);
      $("#url_rpc").append(option);
    }
  });
  addToLog("Duyệt xong RPC");
}

function listAvatar() {
  var address = $("#Address9c").val();
  var url = url9cscanApi + "/account?address=" + address;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 404) {
        throw $.i18n("_9cscan-listAvatar-error-1");
      } else {
        throw $.i18n("_9cscan-listAvatar-error-2", response.status);
      }
    })
    .then((data) => {
      if (Array.isArray(data) && data.length === 0) {
        throw $.i18n("_9cscan-listAvatar-error-1");
      } else {
        return data; // Trả về dữ liệu
      }
    })
    .then(function(data) {
      // Xóa danh sách hiện có (nếu tồn tại)
      $("#avatarSelect").empty();
      var _count = 0;
      data.forEach(function(item) {
        var $option = $("<option>")
          .text(item.avatar.name + " #" + item.avatar.address.substring(2, 6) + " • " + item.avatar.level)
          .val(item.avatar.address);
        $("#avatarSelect").append($option);
      });
    })
    .catch(function(error) {
      // Xóa danh sách hiện có (nếu tồn tại)
      $("#avatarSelect").empty();

      var $option = $("<option>").text(error).val("");
      $("#avatarSelect").append($option);

      console.log("Lỗi: " + error);
    });
}

//////////////////////////////////////////////////////////////////////////////

function startUseNodeTask(typeAuto) {
  handleUseNodeTasks.startUseNode(typeAuto);
}

async function claimPatrolRewardUseNode() {
  try {
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.gif");
    const taskOutput = $("#taskOutput");
    const taskProgress = $("<p>");

    taskOutput.prepend($("<p class='fs-5'>").text($.i18n("task-claimPatrolReward-taskOutput-start")));
    taskOutput.prepend(taskProgress);

    progress = 0;
    if (!shouldContinue(progress, "autoClaimPatrolReward-switch")) {
      taskOutput.prepend($("<p>").text($.i18n("task-claimPatrolReward-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-claimPatrolReward-taskOutput-progress", progress));
    var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
    var avatarAddress = getDataFromSessionStorage("session_login9cmd", "avatarAddress");
    taskOutput.prepend(`<p>Address: <span class="user-select-all">${Address9c}</span></p>`, `<p>Avatar: <span class="user-select-all">${avatarAddress}</span></p>`);
    try {
      var post_data_json = {
        query: `mutation {
      claim(agentAddress: "${Address9c}" avatarAddress: "${avatarAddress}")
    }`
      };
      let url = urlProxy_default + "/" + urlPatrolGraphql;
      taskOutput.prepend(`<p>URL: <span class="user-select-all">${url}</span></p>`);
      taskOutput.prepend(`<p>Send: <span class="user-select-all">${JSON.stringify(post_data_json)}</span></p>`);
      var response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(post_data_json),
        headers: {
          "Content-Type": "application/json",
        },
      });
      var apiResponse = await response.json();
      taskOutput.prepend(`<p>Receive: <span class="user-select-all">${JSON.stringify(apiResponse)}</span> </p>`);

      if (apiResponse && apiResponse.data && apiResponse.data.claim !== null) {
        const checkStatusSuccess = $("<p class='bg-success text-white'>");
        const checkStatusFailure = $("<p class='bg-danger text-white'>");
        const checkStatusStaging = $("<p class='bg-info text-white'>");
        const checkStatusInvalid = $("<p class='bg-dark text-white'>");

        $("#taskOutput").prepend(checkStatusSuccess.text("Success: 0"), checkStatusFailure.text("Failure: 0"), checkStatusStaging.text("Staging: 0"), checkStatusInvalid.text("Invalid: 0"));

        let transArray = [apiResponse.data.claim];
        let numTrans = 1;
        for (let trans of transArray) {
          $("#taskOutput").prepend("Check status 25 times • Transaction " + numTrans + " • " + trans);
          let successCount = 0;
          let stagingCount = 0;
          let failureCount = 0;
          let invalidCount = 0;

          for (let i = 0; i <= 25; i += 1) {
            const response = await fetch(`${url9cscanApi}/transactions/${trans}/status`);
            const data = await response.json();

            if (data.status === 'SUCCESS') {
              showNotification($.i18n("showNotification-tryUseNode-claimPatrolReward-checkStatus-success"), "success", showNotification_timeShow);
              successCount++;
              checkStatusSuccess.text("Success: " + successCount);
              i += 25;
            } else if (data.status === 'STAGING') {
              stagingCount++;
              checkStatusStaging.text("Staging: " + stagingCount);
              if (i == 25) {
                showNotification($.i18n("showNotification-tryUseNode-claimPatrolReward-checkStatus-staging"), "info", showNotification_timeShow);
              }
            } else if (data.status === 'FAILURE') {
              showNotification($.i18n("showNotification-tryUseNode-claimPatrolReward-checkStatus-failure"), "error", showNotification_timeShow);
              failureCount++;
              checkStatusFailure.text("Failure: " + failureCount);
              i += 25;
            } else if (data.status === 'INVALID') {
              invalidCount++;
              checkStatusInvalid.text("Invalid: " + invalidCount);
              i += 5;
              if (i >= 25) {
                showNotification($.i18n("showNotification-tryUseNode-claimPatrolReward-checkStatus-invalid"), "warning", showNotification_timeShow);
              }
            }

            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      } else if (apiResponse && apiResponse.errors && apiResponse.errors[0].message) {
        throw apiResponse.errors[0].message;
      } else {
        throw $.i18n("showNotification-fetchPatrolReward-apiResponse-error-2");
      }
    } catch (error) {
      delDataFromSessionStorage("session_login9cmd", "patrolRewardInfo");
      console.log("Lỗi khi nhận quà Patrol" + error);
      throw error;
    }
    progress = 100;
    if (!shouldContinue(progress, "autoClaimPatrolReward-switch")) {
      taskOutput.prepend($("<p>").text($.i18n("task-claimPatrolReward-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }

    taskOutput.prepend($("<p>").text($.i18n("task-claimPatrolReward-taskOutput-completed")));
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
  } catch (error) {
    $("#taskOutput").prepend($("<p>").text($.i18n("task-claimPatrolReward-taskOutput-error", error)));
    showNotification($.i18n("task-claimPatrolReward-taskOutput-error", error), "error", showNotification_timeShow);
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
  }
}



async function RefillAPUseNode() {
  try {
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.gif");
    const taskOutput = $("#taskOutput");
    const taskProgress = $("<p>");

    taskOutput.prepend($("<p class='fs-5'>").text($.i18n("task-refillAP-taskOutput-start")));
    taskOutput.prepend(taskProgress);
    await delayUseNode();
    progress = 0;
    if (!shouldContinue(progress, "on_off_auto_refillAP")) {
      taskOutput.prepend($("<p>").text($.i18n("task-refillAP-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-refillAP-taskOutput-progress", progress));
    await delayUseNode();

    progress = 25;
    if (!shouldContinue(progress, "on_off_auto_refillAP")) {
      taskOutput.prepend($("<p>").text($.i18n("task-refillAP-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-refillAP-taskOutput-progress", progress));
    await delayUseNode();

    progress = 50;
    if (!shouldContinue(progress, "on_off_auto_refillAP")) {
      taskOutput.prepend($("<p>").text($.i18n("task-refillAP-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-refillAP-taskOutput-progress", progress));
    await delayUseNode();

    progress = 75;
    if (!shouldContinue(progress, "on_off_auto_refillAP")) {
      taskOutput.prepend($("<p>").text($.i18n("task-refillAP-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-refillAP-taskOutput-progress", progress));
    await delayUseNode();

    progress = 100;
    if (!shouldContinue(progress, "on_off_auto_refillAP")) {
      taskOutput.prepend($("<p>").text($.i18n("task-refillAP-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }

    // for (let progress = 0; progress <= 100; progress += 30) {
    // if (!shouldContinue(progress, "on_off_auto_refillAP")) {
    // taskOutput.prepend($("<p>").text(`Refill AP task stop by user, completed ${progress}%`));
    // return;
    // }

    // await delayUseNode();
    // taskProgress.text(`Refill AP task progress now: ${progress}%`);
    // }

    taskOutput.prepend($("<p>").text($.i18n("task-refillAP-taskOutput-completed")));
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
  } catch (error) {
    $("#taskOutput").prepend($("<p>").text($.i18n("task-refillAP-taskOutput-error", error)));
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
  }
}

async function SweepUseNode() {
  try {
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.gif");
    await delayUseNode();
    const taskOutput = $("#taskOutput");
    const taskProgress = $("<p>");

    taskOutput.prepend($("<p class='fs-5'>").text($.i18n("task-sweep-taskOutput-start")));
    taskOutput.prepend(taskProgress);

    progress = 0;
    if (!shouldContinue(progress, "on_off_auto_sweep")) {
      taskOutput.prepend($("<p>").text($.i18n("task-sweep-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-sweep-taskOutput-progress", progress));
    await delayUseNode();

    progress = 25;
    if (!shouldContinue(progress, "on_off_auto_sweep")) {
      taskOutput.prepend($("<p>").text($.i18n("task-sweep-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-sweep-taskOutput-progress", progress));
    await delayUseNode();

    progress = 50;
    if (!shouldContinue(progress, "on_off_auto_sweep")) {
      taskOutput.prepend($("<p>").text($.i18n("task-sweep-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-sweep-taskOutput-progress", progress));
    await delayUseNode();

    progress = 75;
    if (!shouldContinue(progress, "on_off_auto_sweep")) {
      taskOutput.prepend($("<p>").text($.i18n("task-sweep-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }
    taskProgress.text($.i18n("task-sweep-taskOutput-progress", progress));
    await delayUseNode();

    progress = 100;
    if (!shouldContinue(progress, "on_off_auto_sweep")) {
      taskOutput.prepend($("<p>").text($.i18n("task-sweep-taskOutput-stop-by-user", progress)));
      $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
      return;
    }

    taskOutput.prepend($("<p>").text($.i18n("task-sweep-taskOutput-completed")));
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
  } catch (error) {
    $("#taskOutput").prepend($("<p>").text($.i18n("task-sweep-taskOutput-error", error)));
    $("#runGifBarUseNode").attr("src", "assets/img/gif/run.png");
  }
}



function shouldContinue(progress, autoOnOffCheck) {
  const continueUseNodeCheckbox = document.getElementById("continueUseNodeCheckbox");
  const autoOnOffCheckbox = document.getElementById(autoOnOffCheck);
  addDataForSessionStorage("tempNineCMD", "taskUseNodePercentageNow", progress);
  return continueUseNodeCheckbox.checked && autoOnOffCheckbox.checked;
}

const handleUseNodeTasks = {
  isUseNodeBusy: false,
  pendingUseNodeTasks: [],

  startUseNode: function(typeAuto) {
    this.pendingUseNodeTasks.push({
      typeAuto
    });
    this.processUseNodeTasks();
  },

  processUseNodeTasks: async function() {
    if (this.isUseNodeBusy || this.pendingUseNodeTasks.length === 0) {
      return;
    }

    this.isUseNodeBusy = true;
    const task = this.pendingUseNodeTasks.shift();
    const typeAuto = task.typeAuto;

    if (typeAuto === "refillAP" && document.getElementById("on_off_auto_refillAP").checked && document.getElementById("continueUseNodeCheckbox").checked) {
      await RefillAPUseNode();
    } else if (typeAuto === "sweep" && document.getElementById("on_off_auto_sweep").checked && document.getElementById("continueUseNodeCheckbox").checked) {
      await SweepUseNode();
    } else if (typeAuto === "claimPatrolReward" && document.getElementById("autoClaimPatrolReward-switch").checked && document.getElementById("continueUseNodeCheckbox").checked) {
      await claimPatrolRewardUseNode();
      fetchDataAvatarAgain();
    }

    this.isUseNodeBusy = false;
    this.processUseNodeTasks();
    updateTaskInfo();
  },
};

function updateTaskInfo() {
  const taskCountSpan = $("#taskCount");
  const taskListSpan = $("#taskList");
  const taskListItems = $("#taskListItems");

  const taskCount = handleUseNodeTasks.pendingUseNodeTasks.length;
  const taskList = handleUseNodeTasks.pendingUseNodeTasks
    .map(
      (task, index) => `
				<li class="list-group-item d-flex justify-content-between align-items-center listTaskUseNode-${task.typeAuto}">
					<span data-i18n="task-taskListItems-${task.typeAuto}">Task list</span>
					<img class="delete-task" onclick="deleteTask(${index})" src="assets/img/Common/UI_Common/button_gold_close.png"></img>
				</li>
			`
    )
    .join("");

  taskCountSpan.text(taskCount);
  taskListSpan.text(taskCount);
  taskListItems.html(taskList);
  $('html').i18n();
}

function deleteTask(index) {
  handleUseNodeTasks.pendingUseNodeTasks.splice(index, 1);
  updateTaskInfo();
}

// Xóa tất cả các công việc đang chờ
function deleteAllTasks() {
  handleUseNodeTasks.pendingUseNodeTasks = [];
  updateTaskInfo();
}

function tryUseNode_claimPatrolReward() {
  showNotification($.i18n("showNotification-tryUseNode-tryClaimPatrolReward"), "alert", showNotification_timeShow);
  if (!$("#continueUseNodeCheckbox").prop("checked")) {
    showNotification($.i18n("showNotification-tryUseNode-claimPatrolReward-info-1"), "info", showNotification_timeShow);
    return;
  }
  if (!$("#autoClaimPatrolReward-switch").prop("checked")) {
    showNotification($.i18n("showNotification-tryUseNode-claimPatrolReward-info-2"), "info", showNotification_timeShow);
    return;
  }
  startUseNodeTask("claimPatrolReward");
}

function tryUseNode_refillAP() {
  if (getDataFromSessionStorage("tempNineCMD", "canAuto") !== true) {
    showNotification($.i18n("showNotification-tryUseNode-refillAP-info-1"), "info", showNotification_timeShow);
    return;
  }
  if (!$("#continueUseNodeCheckbox").prop("checked")) {
    showNotification($.i18n("showNotification-tryUseNode-refillAP-info-2"), "info", showNotification_timeShow);
    return;
  }
  if (!$("#on_off_auto_refillAP").prop("checked")) {
    showNotification($.i18n("showNotification-tryUseNode-refillAP-info-3"), "info", showNotification_timeShow);
    return;
  }
  startUseNodeTask("refillAP");
}

function tryUseNode_sweep() {
  if (getDataFromSessionStorage("tempNineCMD", "canAuto") !== true) {
    showNotification($.i18n("showNotification-tryUseNode-sweep-info-1"), "info", showNotification_timeShow);
    return;
  }
  if (!$("#continueUseNodeCheckbox").prop("checked")) {
    showNotification($.i18n("showNotification-tryUseNode-sweep-info-2"), "info", showNotification_timeShow);
    return;
  }
  if (!$("#on_off_auto_sweep").prop("checked")) {
    showNotification($.i18n("showNotification-tryUseNode-sweep-info-3"), "info", showNotification_timeShow);
    return;
  }

  startUseNodeTask("sweep");
}

function checkAllswitch_useNodeTask() {
  $(".switch-useNodeTask").prop("checked", true);
}

function canAutoListItems() {
  const isDonater = getDataFromSessionStorage("tempNineCMD", "isDonater");
  const hasUTCFile = getDataFromSessionStorage("tempNineCMD", "hasUTCFile");
  const passwordOk = getDataFromSessionStorage("tempNineCMD", "passwordOk");
  const serverOk = getDataFromSessionStorage("tempNineCMD", "serverOk");
  const errorYourServer = getDataFromSessionStorage("tempNineCMD", "errorYourServer");

  const items = [];
  let counter = 4;

  // Is Donater
  if (isDonater === true) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-isDonater", "success", "bi-check-circle"));
    counter--;
  } else if (isDonater === false) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-isDonater", "danger", "bi-x-circle"));
  } else {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-isDonater", "dark", "bi-question-circle"));
  }

  // Has UTC File
  if (hasUTCFile === true) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-hasUTCFile", "success", "bi-check-circle"));
    counter--;
  } else if (hasUTCFile === false) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-hasUTCFile", "danger", "bi-x-circle"));
  } else {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-hasUTCFile", "dark", "bi-question-circle"));
  }

  // Password Ok
  if (passwordOk === true) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-passwordOk", "success", "bi-check-circle"));
    counter--;
  } else if (passwordOk === false) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-passwordOk", "danger", "bi-x-circle"));
  } else {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-passwordOk", "dark", "bi-question-circle"));
  }

  // Your Server Ok
  if (serverOk === true) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-serverOk", "success", "bi-check-circle"));
    counter--;
  } else if (serverOk === false) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-serverOk", "danger", "bi-x-circle"));
  } else {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-serverOk", "dark", "bi-question-circle"));
  }

  // Has error
  if ((errorYourServer === null) || (errorYourServer === "")) {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-errorYourServer", "light", "bi-circle", ""));
  } else {
    items.push($.i18n("settingNineCMD-tabManageCanAuto-errorYourServer", "danger", "bi-x-circle", errorYourServer));
  }

  const listHtml = `<ul class="list-group">${items.join("")}</ul>`;

  // Xóa listHtml cũ
  $("#tabManageCanAuto").empty();
  if (counter > 0) {
    $("#warningCanAutoCount").text(counter);
    $("#warningCanAutoCount").css("display", "block");
    addDataForSessionStorage("tempNineCMD", "canAuto", false);
  } else {
    $("#warningCanAutoCount").css("display", "none");
    addDataForSessionStorage("tempNineCMD", "canAuto", true);
  }
  // Áp dụng listHtml mới vào thẻ div
  $("#tabManageCanAuto").html(listHtml);
}

function randomStageSweep_pick() {
  var numberItems = document.getElementsByClassName("randomStageSweep_pick");
  var randomIndex = Math.floor(Math.random() * numberItems.length);

  if (numberItems.length > 0) {
    // Xóa lớp 'active' khỏi tất cả các phần tử trong danh sách
    for (var i = 0; i < numberItems.length; i++) {
      numberItems[i].classList.remove("active");
    }

    var randomItem = numberItems[randomIndex];
    randomItem.classList.add("active");

    var selectedNumber = randomItem.innerText.split("\n")[0];
    return selectedNumber;
  }

  // Trường hợp không có danh sách, trả về giá trị mặc định hoặc null
  return null;
}

function randomStageSweep_percentage() {
  var numberItems = document.getElementsByClassName("randomStageSweep_pick");
  var totalCount = numberItems.length;

  // Đếm số lần xuất hiện của từng số
  var numberCountMap = {};
  for (var i = 0; i < numberItems.length; i++) {
    var number = parseInt(numberItems[i].textContent, 10);
    if (numberCountMap[number]) {
      numberCountMap[number]++;
    } else {
      numberCountMap[number] = 1;
    }
  }

  // Tính phần trăm và cập nhật giao diện người dùng cho từng số
  for (var i = 0; i < numberItems.length; i++) {
    var number = parseInt(numberItems[i].textContent, 10);
    var count = numberCountMap[number];
    var percentage = (count / totalCount) * 100;
    var percentageElement = numberItems[i].querySelector(".randomStageSweep_percentage");

    // Kiểm tra và tạo phần tử hiển thị phần trăm nếu chưa tồn tại
    if (!percentageElement) {
      percentageElement = document.createElement("span");
      percentageElement.className = "randomStageSweep_percentage";
      numberItems[i].appendChild(percentageElement);
    }

    percentageElement.textContent = percentage.toFixed(2) + "%"; // Hiển thị phần trăm
  }
}
//////////////////////////////////////////////////////////////////////////////

function funcCreatImgItem(data) {
  var template = $('#templateCreatImgItem').html();
  var view = "";
  var optionIcon = "";
  var isEquip = "none";
  $.each(data, function(i, row) {
	  isEquip = "none";
	if (row.equipped) isEquip = "unset";
	optionIcon = [row.statsMap.aTK, row.statsMap.cRI, row.statsMap.dEF, row.statsMap.hIT, row.statsMap.hP, row.statsMap.sPD].map(value => value !== 0 ? '<img class="lazyload template-item-option" src="assets/loading_small.gif" data-src="assets/img/Common/UI_ItemGrade/UI_icon_option_stat.png" alt="optionStat">' : '').join(' ');
	if (row.skills !== null) optionIcon += '<img class="lazyload template-item-option" src="assets/loading_small.gif" data-src="assets/img/Common/UI_ItemGrade/UI_icon_option_skill.png" alt="optionSkill">';
	view += template.replace('%GRADE-1%', row.grade)
	.replace('%GRADE-2%', row.grade)
	.replace('%ISEQUIP%', isEquip)
	.replace('%LEVEL%', row.level)
	.replace('%OPTIONICON%', optionIcon)
	.replace('%IMAGE%', row.image)
	.replace('%UNIQUE_STT%', row.stt)
  })

  return `<div class="row row-cols-4 row-cols-md-4 fixed-table-custom-view-inventory">${view}</div>`
}



//Tạo bảng inventory
function creatTableInventory() {
  var table_inventory_equment = {
    locale: 'en',
    sortReset: true, // Giúp khi sắp xếp sẽ reset bảng về bảng 1
    sortStable: true, // Giúp sắp xếp các cột khác khi cột đc click như nhau
    onCustomViewPostBody: function() {
      // var innerDiv = $(".fixed-table-custom-view .row");
      // innerDiv.removeClass();
      // innerDiv.addClass("row row-cols-4 row-cols-md-4 fixed-table-custom-view-inventory");
      $('.bootstrap-table .fixed-table-container .fixed-table-body').css('height', 'unset');
    }, // Giúp hiện thị 4 item 1 hàng
    onToggleCustomView: function(state) {

      if (state) {

        $('.bootstrap-table .fixed-table-container .fixed-table-body').css('height', 'unset');
      } else {
        $('.bootstrap-table .fixed-table-container .fixed-table-body').css('height', '');
      }
    },
    columns: [
      [{
          title: 'No.',
          field: 'stt',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          visible: true
        }, {
          title: 'Name',
          field: 'name',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'select',
          visible: true
        }, {
          title: 'Item type',
          field: 'itemSubType',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'select',
          visible: true

        }, {
          title: 'CP',
          field: 'CP',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: true
        },

        {
          title: 'Elemental type id',
          field: 'elementalTypeId',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'Is equipped?',
          field: 'equipped',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'select',
          visible: false
        }, {
          title: 'EXP',
          field: 'exp',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'Grade',
          field: 'grade',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'ID',
          field: 'id',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'Item id',
          field: 'itemId',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'Level',
          field: 'level',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'Level required',
          field: 'level_req',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'Mimis level',
          field: 'mimislevel',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: "Item's birth block",
          field: 'requiredBlockIndex',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        }, {
          title: 'setId',
          field: 'setId',
          rowspan: 2,
          align: 'center',
          valign: 'middle',
          sortable: true,
          filterControl: 'input',
          visible: false
        },


        {
          title: 'skills',
          field: 'skills',
          colspan: 6,
          align: 'center'
        }, {
          title: 'Main index',
          field: 'stat',
          colspan: 4,
          align: 'center'
        }, {
          title: 'Sub index',
          field: 'statsMap',
          colspan: 6,
          align: 'center'
        }
      ],
      [{
        field: 'skills.skillId',
        title: 'Skill id',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'skills.skillChance',
        title: 'Skill chance',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'skills.skillElementalType',
        title: 'Skill elemental type',
        sortable: true,
        align: 'center',
        filterControl: 'select',
        visible: false
      }, {
        field: 'skills.skillPower',
        title: 'Skill power',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'skills.skillReferencedStatType',
        title: 'Skill referenced stat type',
        sortable: true,
        align: 'center',
        filterControl: 'select',
        visible: false
      }, {
        field: 'skills.skillStatPowerRatio',
        title: 'Skill stat power ratio',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'stat.baseValue',
        title: 'Stat base value',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'stat.additionalValue',
        title: 'Stat additional value',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'stat.totalValue',
        title: 'Total value',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'stat.statType',
        title: 'Stat type',
        sortable: true,
        align: 'center',
        filterControl: 'select',
        visible: false
      }, {
        field: 'statsMap.aTK',
        title: 'ATK',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'statsMap.cRI',
        title: 'CRI',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'statsMap.dEF',
        title: 'DEF',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'statsMap.hIT',
        title: 'HIT',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'statsMap.hP',
        title: 'HP',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }, {
        field: 'statsMap.sPD',
        title: 'SPD',
        sortable: true,
        align: 'center',
        filterControl: 'input',
        visible: false
      }]
    ],
    data: [],
  }
  $('.table-inventory').bootstrapTable('destroy');
  const modalBackdrop = document.querySelector('.modal-backdrop.fade');

  if (modalBackdrop) {
    modalBackdrop.remove();
  }
  table_inventory_equment.locale = $.i18n().locale;
  $('.table-inventory').bootstrapTable(table_inventory_equment);
  $('.table-inventory').bootstrapTable('changeTitle', {
    stt: $.i18n('table-inventory-stt'),
    name: $.i18n('table-inventory-name'),
    itemSubType: $.i18n('table-inventory-itemSubType'),
    CP: $.i18n('table-inventory-CP'),
    elementalTypeId: $.i18n('table-inventory-elementalTypeId'),
    equipped: $.i18n('table-inventory-equipped'),
    exp: $.i18n('table-inventory-exp'),
    grade: $.i18n('table-inventory-grade'),
    id: $.i18n('table-inventory-id'),
    itemId: $.i18n('table-inventory-itemId'),
    level: $.i18n('table-inventory-level'),
    level_req: $.i18n('table-inventory-level_req'),
    mimislevel: $.i18n('table-inventory-mimislevel'),
    requiredBlockIndex: $.i18n('table-inventory-requiredBlockIndex'),
    setId: $.i18n('table-inventory-setId'),
    skills: $.i18n('table-inventory-skills'),
    stat: $.i18n('table-inventory-stat'),
    statsMap: $.i18n('table-inventory-statsMap'),
    'skills.skillId': $.i18n('table-inventory-skills-skillId'),
    'skills.skillChance': $.i18n('table-inventory-skills-skillChance'),
    'skills.skillElementalType': $.i18n('table-inventory-skills-skillElementalType'),
    'skills.skillPower': $.i18n('table-inventory-skills-skillPower'),
    'skills.skillReferencedStatType': $.i18n('table-inventory-skills-skillReferencedStatType'),
    'skills.skillStatPowerRatio': $.i18n('table-inventory-skills-skillStatPowerRatio'),
    'stat.baseValue': $.i18n('table-inventory-stat-baseValue'),
    'stat.additionalValue': $.i18n('table-inventory-stat-additionalValue'),
    'stat.totalValue': $.i18n('table-inventory-stat-totalValue'),
    'stat.statType': $.i18n('table-inventory-stat-statType'),
    'statsMap.aTK': $.i18n('table-inventory-statsMap-aTK'),
    'statsMap.cRI': $.i18n('table-inventory-statsMap-cRI'),
    'statsMap.dEF': $.i18n('table-inventory-statsMap-dEF'),
    'statsMap.hIT': $.i18n('table-inventory-statsMap-hIT'),
    'statsMap.hP': $.i18n('table-inventory-statsMap-hP'),
    'statsMap.sPD': $.i18n('table-inventory-statsMap-sPD'),
  })
  $('.table-inventory').bootstrapTable('load', getDataFromSessionStorage("session_login9cmd", "dataEquipments") !== null ? getDataFromSessionStorage("session_login9cmd", "dataEquipments") : []);
  $('.table-inventory').bootstrapTable('sortBy', {
    field: 'CP',
    sortOrder: 'desc'
  });

  //Làm mới bảng
  $('.table-inventory').on('refresh.bs.table', function() {
    creatTableInventory();
  });

}
function processDataCSVName(csvData) {
  const rows = csvData.split('\n');
  const headers = rows[0].split(',');

  // Lấy cột được chọn dựa trên ngôn ngữ hiện tại
  let selectedColumn = 'English';
  const currentLanguage = $.i18n().locale;

  if (langCSV_default[currentLanguage]) {
    selectedColumn = langCSV_default[currentLanguage];
  }

  // Lấy dữ liệu CSV từ session data (tempNineCMD)
  let dataCSV = getDataFromSessionStorage('tempNineCMD', 'dataCSV');

  if (!dataCSV) {
    dataCSV = {};
  }

  // Lặp qua các hàng dữ liệu từ hàng thứ hai trở đi
  for (let i = 1; i < rows.length; i++) {
    const rowData = rows[i].split(',');

    // Lấy khóa và giá trị từ dữ liệu CSV
    const itemId = rowData[0].replace(text2replaceNameItem, '');
    const itemValue = rowData[headers.indexOf(selectedColumn)];

    // Kiểm tra xem itemId đã tồn tại trong dataCSV hay chưa
    if (dataCSV[itemId]) {
      // Ghi đè giá trị vào khóa name trong itemId
      dataCSV[itemId]['name'] = itemValue;
    } else {
      // Tạo một đối tượng mới với khóa name và giá trị tương ứng
      dataCSV[itemId] = {
        'name': itemValue
      };
    }
  }

  // Lưu đối tượng dataCSV vào session data
  addDataForSessionStorage('tempNineCMD', 'dataCSV', dataCSV);
}

function processDataCSVLevelReq(csvData) {
  const rows = csvData.split('\n');


  // Lấy dữ liệu CSV từ session data (tempNineCMD)
  let dataCSV = getDataFromSessionStorage('tempNineCMD', 'dataCSV');

  if (!dataCSV) {
    dataCSV = {};
  }

  // Lặp qua các hàng dữ liệu từ hàng thứ hai trở đi
  for (let i = 1; i < rows.length; i++) {
    const rowData = rows[i].split(',');

    // Lấy khóa và giá trị từ dữ liệu CSV
    const itemId = rowData[0];
    const level_req = rowData[1];
    const mimislevel = rowData[2];

    // Kiểm tra xem itemId đã tồn tại trong dataCSV hay chưa
    if (dataCSV[itemId]) {
      dataCSV[itemId]['level_req'] = parseInt(level_req);
      dataCSV[itemId]['mimislevel'] = parseInt(mimislevel);
    } else {
      // Tạo một đối tượng mới với khóa và giá trị tương ứng
      dataCSV[itemId] = {
        'level_req': level_req,
        'mimislevel': mimislevel
      };
    }
  }

  // Lưu đối tượng dataCSV vào session data
  addDataForSessionStorage('tempNineCMD', 'dataCSV', dataCSV);
}
////////////////////////
function translateLocaleFunc() {
  // Thay thế các biến vào data-args-translateLocale
  document.querySelector('.needReplaceTrans-autoRefresh').setAttribute('data-args-translateLocale', document.querySelector('.needReplaceTrans-autoRefresh').getAttribute('data-args-translateLocale').replace('timerFetchDataAvatar_setTimeout', timerFetchDataAvatar_setTimeout / 1000));

  $('html').i18n(); // data-i18n="[placeholder]lobby-login-address9c-placeholder"
  $('.translateLocale').each(function() {
    var args = [],
      $this = $(this);
    if ($this.attr('data-args-translateLocale')) {
      args = $this.attr('data-args-translateLocale').split(',');
    }
    $this.html($.i18n.apply(null, args)); // translateLocale" data-args-translateLocale="lobby-login-address9c-noteText"
  });
}
