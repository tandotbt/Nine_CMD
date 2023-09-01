////
// Hàm khởi động công việc sử dụng your server với các tham số tùy chỉnh
function startFuncUseServerTask(dataNeed) {
    handleFuncUseServerTasks.startFuncUseServer(dataNeed, "1");
}

async function FuncUseServer(dataNeed) {
    try {
        await requestToYourServer();

        console.log(`FuncUseServer task completed with request ${dataNeed}`);
    } catch (error) {
        console.log("Error in FuncUseServer or one of the steps:", error);
        showNotification(error, "error", 5000);
        throw new Error("Error in FuncUseServer or one of the steps:" + error);
    }
}

// Đối tượng quản lý công việc và hiển thị thông báo
var handleFuncUseServerTasks = {
    isFuncUseServerBusy: false,
    pendingFuncUseServerTasks: [],

    startFuncUseServer: function (dataNeed) {
        this.pendingFuncUseServerTasks.push({ dataNeed });
        this.processFuncUseServerTasks();
    },

    processFuncUseServerTasks: async function () {
        if (this.isFuncUseServerBusy) {
            return;
        }

        if (this.pendingFuncUseServerTasks.length === 0) {
            return;
        }

        this.isFuncUseServerBusy = true;
        var task = this.pendingFuncUseServerTasks.shift();
        var dataNeed = task.dataNeed;

        var output = $("#output");
        var progress = $("<p>").text(`Processing FuncUseServer task with request ${dataNeed}...`);
        output.append(progress);

        try {
            var result = await FuncUseServer(dataNeed);
            var completionMsg = $("<p>").text(`FuncUseServer task completed with request ${dataNeed}`);
            output.append(completionMsg);
        } catch (error) {
            var errorMsg = $("<p>").text(`Error occurred during FuncUseServer task with request ${dataNeed}`);
            output.append(errorMsg);
        }

        this.isFuncUseServerBusy = false;
        this.processFuncUseServerTasks();
        // updateTaskInfo();
    },
};

function requestToYourServer() {
    return new Promise(async (resolve, reject) => {
        var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
        var password = getDataFromSessionStorage("session_login9cmd", "password");
        var url_Server = getDataFromSessionStorage("session_login9cmd", "url_Server");
        var passwordServer = getDataFromSessionStorage("session_login9cmd", "passwordServer");

        var request = getDataFromSessionStorage("session_login9cmd", "request");
        var dataRequest = getDataFromSessionStorage("session_login9cmd", "dataRequest");

        var intervalId = null; // Lưu trữ ID của interval
        var isCheckingChanges = false; // Biến kiểm tra xem vòng lặp đang chạy hay không
        var currentRand = null; // Lưu trữ số ngẫu nhiên hiện tại

        async function sendData() {
            var rand = Math.floor(Math.random() * 100) + 1; // Tạo số ngẫu nhiên từ 1 đến 100
            currentRand = rand; // Lưu trữ số ngẫu nhiên hiện tại
            var data = {
                rand: rand,
                Address9c: Address9c,
                password: password,
                request: request,
                data: dataRequest,
            };
            try {
                await fetch("https://jsonblob.com/api/" + passwordServer + "/" + url_Server, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
                console.log("Dữ liệu đã được gửi thành công với yêu cầu " + request);
                await checkChanges(url_Server);
                resolve(); // Gửi tín hiệu hoàn thành Promise
            } catch (error) {
                // console.error("Lỗi khi gửi dữ liệu: " + error);
                reject(error); // Gửi tín hiệu lỗi của Promise
            }
        }

        function checkChanges(url_Server) {
            return new Promise((resolve, reject) => {
                let isCheckingChanges = true; // Đánh dấu vòng lặp đang chạy
                let intervalId;
                let counter = 0; // Biến đếm số lần console.log("Server chưa phản hồi")

                function checkServerResponse() {
                    fetch("https://jsonblob.com/api/" + passwordServer + "/" + url_Server)
                        .then(function (response) {
                            if (!response.ok) {
                                throw new Error("Lỗi khi kiểm tra dữ liệu. Mã lỗi: " + response.status);
                            }
                            return response.json();
                        })
                        .then(function (data) {
                            var newRand = data.rand;
                            var kqua = data.data;
                            if (newRand > currentRand) {
                                console.log("Số ngẫu nhiên mới: " + newRand);
                                console.log("Lưu lại kqua cho yêu cầu " + request);
                                addDataForSessionStorage("session_login9cmd", request, kqua);
                                addDataForSessionStorage("session_login9cmd", "hasUTC", "yes");
                                clearTimeout(intervalId); // Dừng vòng lặp kiểm tra
                                isCheckingChanges = false; // Đánh dấu vòng lặp không còn chạy
                                resolve(); // Gửi tín hiệu hoàn thành Promise
                            } else if (newRand < currentRand) {
                                console.log("Có lỗi server gửi về");
                                clearTimeout(intervalId); // Dừng vòng lặp kiểm tra
                                isCheckingChanges = false; // Đánh dấu vòng lặp không còn chạy
                                throw new Error(" - " + kqua); // Tung ra đối tượng lỗi mới với thông điệp
                            } else {
                                counter++;
                                if (counter > 60) {
                                    clearTimeout(intervalId); // Dừng vòng lặp kiểm tra
                                    isCheckingChanges = false; // Đánh dấu vòng lặp không còn chạy
                                    throw new Error("Server không phản hồi trong 60s");
                                } else {
                                    console.log("Server chưa phản hồi");
                                }
                            }
                        })
                        .catch(function (error) {
                            // console.error("Lỗi khi kiểm tra dữ liệu: " + error);
                            delDataFromSessionStorage("session_login9cmd", request);
                            delDataFromSessionStorage("session_login9cmd", "hasUTC");
                            reject(error); // Gửi tín hiệu lỗi của Promise (nếu cần thiết)
                        });
                }

                intervalId = setInterval(checkServerResponse, 1000); // Kiểm tra thay đổi mỗi giây (có thể điều chỉnh thời gian tùy ý)
            });
        }

        await sendData();
    });
}

/////////////// Làm mới info avatar liên tục
// Hàm để gọi fetch và xử lý dữ liệu
function fetch_data_block_now() {
    // addToLog("Thử lấy block now và avg")
    fetch("https://jsonblob.com/api/jsonBlob/1141252404015915008")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("code error" + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            if (data.hasOwnProperty("message")) {
                var errorMessage = data.message;
                throw new Error(errorMessage);
            }
            return data;
        })
        .then(function (data) {
            // Chuyển đổi đối tượng JSON thành một mảng
            var blockNowArray = [];
            blockNowArray.push(data);
            table_node_now(blockNowArray);
            var _temp = JSON.stringify(data);
            localStorage.setItem("blockNowJson", _temp);
            // addToLog("Hoàn thành lấy block now và avg")
        })
        .catch(function (Error) {
            addToLog("lỗi khi lấy block now và avg: " + Error);
            showNotification(Error, "error", 5000);
            localStorage.removeItem("blockNowJson");
            return;
        });
}
function delayUseNode() {
    var delayUseNode1 = document.getElementById("delayUseNode");
    var delayUseNode;

    if (delayUseNode1 === null) {
        delayUseNode = 10000;
        showNotification("Warting node ... 10s", "alert", delayUseNode);
    } else {
        delayUseNode = parseInt(delayUseNode1.value) * 1000; // Chuyển đổi đơn vị giây thành mili-giây
        showNotification("Warting node ... " + parseInt(delayUseNode1.value) + "s", "alert", delayUseNode);
    }

    console.log("Thời gian delay node: " + delayUseNode);
    return new Promise((resolve) => setTimeout(resolve, delayUseNode));
}

function fetchDataAvatar() {
    console.log("Bắt đầu fetch avatar");
    var submitBtn = document.getElementById("submit_login_form");
    Promise.all([getArmorIDandSTT(), fetchDataAvatar_useNode(), checkYourServer(), checkDonaterBlock()])
        .then(() => {
            console.log("Kết thúc fetch avatar");

            submitBtn.innerHTML = "Submit";
            submitBtn.disabled = false;
        })
        .catch((error) => {
            console.log("Đã xảy ra lỗi trong quá trình fetch avatar:", error);

            submitBtn.innerHTML = "Submit";
            submitBtn.disabled = false;
        });
}

// Lấy name, level, ncg, cryslat, AP và time AP
async function fetchDataAvatar_useNode() {
    console.log("fetchDataAvatar_useNode start");
    var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
    var avatarAddress = getDataFromSessionStorage("session_login9cmd", "avatarAddress");
    var url_rpc = getDataFromSessionStorage("session_login9cmd", "url_rpc");
    try {
        // Lấy name, level, crystal, ncg, AP, refill time
        var post_data_json1 = {
            query: `query{stateQuery{agent(address:"${Address9c}"){gold,crystal,avatarStates{address,actionPoint,level,dailyRewardReceivedIndex,name}}}}`,
        };
        await delayUseNode();
        var response1 = await fetch(url_rpc, {
            method: "POST",
            body: JSON.stringify(post_data_json1),
            headers: {
                "Content-Type": "application/json",
            },
        });

        var apiResponse1 = await response1.json();

        var agentDataJson = null;

        if (apiResponse1 && apiResponse1.data && apiResponse1.data.stateQuery && apiResponse1.data.stateQuery.agent) {
            var avatarStates = apiResponse1.data.stateQuery.agent.avatarStates;
            for (var i = 0; i < avatarStates.length; i++) {
                if (avatarStates[i].address === avatarAddress) {
                    agentDataJson = avatarStates[i];
                    break;
                }
            }
        } else if (apiResponse1 && apiResponse1.error && apiResponse1.errors[0].message) {
            throw (error = apiResponse1.errors[0].message);
        } else {
            throw (error = "fetch use node - Unknown error");
        }

        if (agentDataJson) {
            var name = agentDataJson.name;
            var level = agentDataJson.level;
            var crystalRAW = apiResponse1.data.stateQuery.agent.crystal;
            var gold = apiResponse1.data.stateQuery.agent.gold;
            var crystal = Math.floor(parseFloat(crystalRAW));
            var actionPoint = agentDataJson.actionPoint;
            var dailyRewardReceivedIndex = agentDataJson.dailyRewardReceivedIndex;
            // Lưu dữ liệu avatar info
            var avatarInfo = JSON.parse(sessionStorage.getItem("session_login9cmd")) || {};

            avatarInfo.name = name;
            avatarInfo.level = level;
            avatarInfo.gold = gold;
            avatarInfo.crystal = crystal;
            avatarInfo.actionPoint = actionPoint;
            avatarInfo.dailyRewardReceivedIndex = dailyRewardReceivedIndex;

            sessionStorage.setItem("session_login9cmd", JSON.stringify(avatarInfo));
        } else {
            throw (Error = "Không tìm thấy dữ liệu cho avatarAddress:" + avatarAddress);
        }
    } catch (error) {
        console.error(error);
        delDataFromSessionStorage("session_login9cmd", "name");
        delDataFromSessionStorage("session_login9cmd", "level");
        delDataFromSessionStorage("session_login9cmd", "gold");
        delDataFromSessionStorage("session_login9cmd", "crystal");
        delDataFromSessionStorage("session_login9cmd", "actionPoint");
        delDataFromSessionStorage("session_login9cmd", "dailyRewardReceivedIndex");
        return { error: "Có lỗi xảy ra trong fetchDataAvatar_useNode()" };
    }
}

async function getArmorIDandSTT() {
    console.log("getArmorIDandSTT start");
    var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
    var avatarAddress = getDataFromSessionStorage("session_login9cmd", "avatarAddress").toLowerCase();
    var url = "https://api.9cscan.com/account?address=" + Address9c;
    fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                throw new Error("get armor ID and STT - Not found avatar");
            } else {
                throw new Error("get armor ID and STT - Request failed with status: " + response.status);
            }
        })
        .then((data) => {
            if (Array.isArray(data) && data.length === 0) {
                throw new Error("get armor ID and STT - Not found avatar");
            } else {
                return data; // Trả về dữ liệu
            }
        })
        .then(function (apiData) {
            var matchingAvatar = apiData.find(function (item) {
                return item.avatarAddress.toLowerCase() === avatarAddress;
            });

            if (matchingAvatar) {
                var stt = apiData.indexOf(matchingAvatar) + 1;
                var armorId = 10200000; // ID mặc định
                // Kiểm tra xem mảng equipments có tồn tại hay không
                if (!matchingAvatar.avatar.inventory || matchingAvatar.avatar.inventory.equipments.length === 0) {
                    var armorEquipment = false;
                } else {
                    // Tìm trong mảng equipments để tìm giá trị id của "itemSubType": "ARMOR"
                    var armorEquipment = matchingAvatar.avatar.inventory.equipments.find(function (equipment) {
                        return equipment.itemSubType === "ARMOR";
                    });
                }

                if (armorEquipment) {
                    armorId = armorEquipment.id;
                }
                addDataForSessionStorage("session_login9cmd", "armorId", armorId);
                addDataForSessionStorage("session_login9cmd", "stt", stt);
            }
        })
        .catch(function (error) {
            console.log(error);
            return { error: "Có lỗi xảy ra trong getArmorIDandSTT()" };
        });
}

async function checkDonaterBlock() {
    console.log("checkDonaterBlock start");

    var donater = getDataFromSessionStorage("session_login9cmd", "donater");
    if (donater) {
        var Address9c = getDataFromSessionStorage("session_login9cmd", "Address9c");
        var Address9cLower = Address9c.toLowerCase();
        fetch("https://cors-proxy.fringe.zone/https://api.tanvpn.tk/donater?vi=" + Address9cLower)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("my server code error" + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                if (data.length === 0) {
                    throw new Error("No data");
                }
                addDataForSessionStorage("session_login9cmd", "donaterBlock", data[0].block);
            })
            .catch(function (error) {
                delDataFromSessionStorage("session_login9cmd", "donaterBlock");
                console.log(error);
                return { error: "Có lỗi xảy ra trong checkDonaterBlock()" };
            });
    }
}

async function checkYourServer() {
    console.log("checkYourServer start");
    // Ktra server
    var url_Server = getDataFromSessionStorage("session_login9cmd", "url_Server");

    if (url_Server.length > 0) {
        var passwordServer = getDataFromSessionStorage("session_login9cmd", "passwordServer");
        try {
            var response = await fetch("https://jsonblob.com/api/" + passwordServer + "/" + url_Server);
            if (!response.ok) {
                throw new Error("code error" + response.status);
            }
            var data = await response.json();
            if (data.hasOwnProperty("message")) {
                var errorMessage = data.message;
                throw new Error(errorMessage);
            }
            addDataForSessionStorage("session_login9cmd", "request", "getPublicKey");
            addDataForSessionStorage("session_login9cmd", "dataRequest", "");
            await startFuncUseServerTask("getPublicKey");
        } catch (error) {
            console.log(error);
            return { error: "Có lỗi xảy ra trong checkYourServer()" };
        }
    }
}

// Vẽ lobby
function fetchDataAvatar_display() {
    var blockNow = getDataFromLocalStorage("blockNowJson", "block");
    var avgBlock = getDataFromLocalStorage("blockNowJson", "avgBlock");

    if (blockNow === null) {
        showNotification("Cann't find block now", "error", 5000);
        return;
    }
    var actionPoint = getDataFromSessionStorage("session_login9cmd", "actionPoint");
    var armorId = getDataFromSessionStorage("session_login9cmd", "armorId");
    var crystal = getDataFromSessionStorage("session_login9cmd", "crystal");
    var dailyRewardReceivedIndex = getDataFromSessionStorage("session_login9cmd", "dailyRewardReceivedIndex");
    var donaterBlock = getDataFromSessionStorage("session_login9cmd", "donaterBlock");
    var gold = getDataFromSessionStorage("session_login9cmd", "gold");
    var level = getDataFromSessionStorage("session_login9cmd", "level");
    var name = getDataFromSessionStorage("session_login9cmd", "name");

    var lobbyLoadingVipElements = document.getElementsByClassName("lobby-loading-vip");
    for (var i = 0; i < lobbyLoadingVipElements.length; i++) {
        lobbyLoadingVipElements[i].style.display = "block";
    }

    if (!(armorId === null)) {
        $(".lobby-armorId-view").attr("src", "https://raw.githubusercontent.com/planetarium/NineChronicles/development/nekoyume/Assets/Resources/UI/Icons/Item/" + armorId + ".png");
    } else {
        $(".lobby-armorId-view").attr("src", "assets/img/Common/10200000.png");
    }
    if (!(level === null)) {
        $(".lobby-level-view").text(level);
    } else {
        $(".lobby-level-view").text("0");
    }
    if (!(name === null)) {
        $(".lobby-name-view").text(name);
    } else {
        $(".lobby-name-view").text("No data name");
    }

    if (!(donaterBlock === null)) {
        // Tính toán số giây
        let seconds = (donaterBlock - blockNow) * avgBlock;

        // Chuyển đổi thành giờ, phút, giây hoặc ngày, giờ
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let remainingSeconds = seconds % 60;

        // Xác định lớp CSS dựa trên số giờ
        let cssClass = "";
        let timeText = "";
        if (hours < 48) {
            cssClass = "text-warning";
            timeText = hours + "h " + minutes + "m";
        } else {
            cssClass = "text-success";
            let days = Math.floor(hours / 24);
            let remainingHours = hours % 24;
            timeText = days + "day " + remainingHours + "h";
        }

        // Đặt nội dung và lớp CSS cho phần tử
        $(".lobby-donater-view").html('<i class="bi-cart2 ' + cssClass + '"></i> ' + (donaterBlock - blockNow) + " (" + timeText + ")");
    } else {
        $(".lobby-donater-view").html('<i class="bi-cart2"></i>  No donater');
    }
    var _temp2 = document.getElementsByClassName("lobby-loading-vip image-avatar");
    _temp2[0].style.display = "none";
    if (!(dailyRewardReceivedIndex === null)) {
        // Tính toán số giây
        let seconds = (dailyRewardReceivedIndex - blockNow + 1700) * avgBlock;

        // Chuyển đổi thành giờ, phút, giây hoặc ngày, giờ
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let remainingSeconds = seconds % 60;

        $(".lobby-AP-bar-view-5").text(hours + "h " + minutes + "m");
    } else {
        $(".lobby-AP-bar-view-5").text("No data");
    }
    if (!(crystal === null)) {
        $(".lobby-crystal-bar-view-3").text(crystal);
        var _temp2 = document.getElementsByClassName("lobby-loading-vip lobby-crystal-bar-view-4");
        _temp2[0].style.display = "none";
    } else {
        $(".lobby-crystal-bar-view-3").text("");
    }

    if (!(gold === null)) {
        $(".lobby-NCG-bar-view-3").text(gold);
        var _temp2 = document.getElementsByClassName("lobby-loading-vip lobby-NCG-bar-view-4");
        _temp2[0].style.display = "none";
    } else {
        $(".lobby-NCG-bar-view-3").text("");
    }
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
        if (parsedData.hasOwnProperty(childKey)) {
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
        if (parsedData.hasOwnProperty(childKey)) {
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
document.addEventListener("visibilitychange", function () {
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
            layout: "topCenter",
            timeout: time,
            theme: "mint",
            // closeWith: ["button", "click"],
            closeWith: ["click"],
            progressBar: true,
            container: ".noty_lobby",
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
    var url_Server = document.getElementById("url_server_jsonBlod").value;
    var passwordServer = document.getElementById("passwordServer").value;

    var _9cmd_form_data_login = {
        Address9c: Address9c,
        avatarAddress: avatarAddress,
        password: password,
        donater: is_donater,
        url_rpc: url_rpc,
        url_Server: url_Server,
        passwordServer: passwordServer,
    };
    var _temp = JSON.stringify(_9cmd_form_data_login);
    addToLog("Lưu lại _9cmd_form_data_login:" + _temp);
    localStorage.setItem("_9cmd_form_data_login", _temp);
    sessionStorage.setItem("session_login9cmd", _temp);
}
//////////// Gợi ý hiển thị lại những giá trị đã lưu khi tải trang
window.addEventListener("load", function () {
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
        document.getElementById("url_server_jsonBlod").value = _9cmd_form_data_login_json.url_Server;
        document.getElementById("passwordServer").value = _9cmd_form_data_login_json.passwordServer;
    }
}

/////////// Nhận lệnh từ 1 trong 4 nút lobby
document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.getElementsByClassName("button_lobby");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            var action = this.getAttribute("data-action");

            // Xử lý tác vụ tương ứng
            if (action === "arena") {
                addToLog("Mở arena");
            } else if (action === "stage") {
                addToLog("Mở adventure");
            } else if (action === "shop") {
                addToLog("Mở shop");
            } else if (action === "craft-upgrade") {
                addToLog("Mở workshop");
            }
        });
    }
});

/////////////// Vẽ bảng block now liên tục
function table_node_now(data_table_node_now) {
    // addToLog("Vẽ bảng block now và avg")
    var url_rpc = getDataFromSessionStorage("session_login9cmd", "url_rpc");
    var delayUseNode = parseInt(document.getElementById("delayUseNode").value);
    var student = "";
    $.each(data_table_node_now, function (key, value) {
        student += "<tr>";
        student +=
            '<td><div class="hstack gap-3"><div class="vr"></div>Block: ' +
            value.block +
            '<div class="vr"></div>Avg block time: ' +
            value.avgBlock +
            's<div class="vr"></div>Node: ' +
            url_rpc +
            '<div class="vr"></div>Delay: ' +
            delayUseNode +
            's<div class="vr"></div>' +
            "</div></td>";
        student += "</tr>";
    });
    // Xóa dữ liệu trong bảng infoTable, trừ hàng tiêu đề có lớp 'sticky notHide'
    $("#table_node_now tr:not(.notHide)").remove();

    // INSERTING ROWS INTO TABLE
    $("#table_node_now").append(student);
    fetchDataAvatar_display();
}
/////////////// Hàm chọn node từ link api rpc
function node_list_error(error) {
    addToLog("Lỗi khi load data rpc " + error);
    const data_default = [
        { name: "RPC Node 1", rpc: "9c-main-rpc-1.nine-chronicles.com", url: "https://9c-main-rpc-1.nine-chronicles.com/graphql" },
        { name: "RPC Node 2", rpc: "9c-main-rpc-2.nine-chronicles.com", url: "https://9c-main-rpc-2.nine-chronicles.com/graphql" },
        { name: "RPC Node 3", rpc: "9c-main-rpc-3.nine-chronicles.com", url: "https://9c-main-rpc-3.nine-chronicles.com/graphql" },
    ];
    data_default.forEach(function (item) {
        var optionText = item.name + " • " + item.rpc;
        var optionValue = item.url;
        var option = $("<option>").text(optionText).attr("value", optionValue);
        $("#url_rpc").append(option);
    });
}
function node_list(data) {
    addToLog("Duyệt qua từng dữ liệu RPC");

    data.forEach(function (item) {
        if (item.active === "True") {
            var optionText = item.name + " • " + item.rpcaddress + " • " + item.response_time_seconds + "s • " + item.users;
            var optionValue = item.url;
            var option = $("<option>").text(optionText).attr("value", optionValue);
            $("#url_rpc").append(option);
        }
    });
    addToLog("Duyệt xong RPC");
}

function listAvatar() {
    var address = $("#Address9c").val();
    var url = "https://api.9cscan.com/account?address=" + address;

    fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                throw new Error("Not found avatar");
            } else {
                throw new Error("Request failed with status: " + response.status);
            }
        })
        .then((data) => {
            if (Array.isArray(data) && data.length === 0) {
                throw new Error("Not found avatar");
            } else {
                return data; // Trả về dữ liệu
            }
        })
        .then(function (data) {
            // Xóa danh sách hiện có (nếu tồn tại)
            $("#avatarSelect").empty();
            var _count = 0;
            data.forEach(function (item) {
                var $option = $("<option>")
                    .text(item.avatarName + " • " + item.avatar.level)
                    .val(item.avatar.address);
                $("#avatarSelect").append($option);
            });
        })
        .catch(function (error) {
            // Xóa danh sách hiện có (nếu tồn tại)
            $("#avatarSelect").empty();

            var $option = $("<option>").text(error).val("");
            $("#avatarSelect").append($option);

            console.log("Lỗi: " + error);
        });
}

//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
