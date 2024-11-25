const urlBlockNow = "https://jsonblob.com/api/jsonBlob/1141252404015915008";
const pathNineChronicles = "development";
const pathNineChronicles_armorId = "development";
const ncgStake5AP = 5000;
const ncgStake4AP = 500000;
const armorId_normal = 10200000;
const level_req_default = 0;
const mimislevels_default = 0;
const mathCP = {
  hP: 0.7,
  aTK: 10.5,
  dEF: 10.5,
  sPD: 3,
  hIT: 2.3,
  hasSkill: 1.15
};
const delayUseNode_default = 10000;
const fadeIn_timeShow = 300;
const fadeOut_timeShow = 300;
const customProgressBar_setTimeout = 1000;
const fetchDataAvatar_display_setTimeout = 5000;
const showNotification_timeShow = 5000;
const checkServerResponse_countMax = 60;
const checkServerResponse_setInterval = 1000;
const timerFetchDataAvatar_setTimeout = 300000;
const node_list_default = [{
    name: "RPC Node 1",
    rpc: "9c-main-rpc-1.nine-chronicles.com",
    url: "https://9c-main-rpc-1.nine-chronicles.com/graphql"
  },
  {
    name: "RPC Node 2",
    rpc: "9c-main-rpc-2.nine-chronicles.com",
    url: "https://9c-main-rpc-2.nine-chronicles.com/graphql"
  },
  {
    name: "RPC Node 3",
    rpc: "9c-main-rpc-3.nine-chronicles.com",
    url: "https://9c-main-rpc-3.nine-chronicles.com/graphql"
  },
];
const urlProxy_default = "https://cors-proxy.fringe.zone";
const urlPatrolGraphql = "https://patrol.9c.gg/graphql";
const patrolRewardPolicy = [{
    level: 1,
    crystal: 900,
    silverDust: 6
  },
  {
    level: 150,
    crystal: 1500,
    silverDust: 9
  },
  {
    level: 250,
    crystal: 2400,
    silverDust: 12
  }
];
const secondWaitRewardPatrol = 43200; // chờ 12 giờ
const urlListNodeBy9capi = "https://api.9capi.com/rpc";
const numberNotiShow = 5;
const listLocaleHaveToTran = {
  'en': 'i18n/en.json',
  'vi': 'i18n/vi.json'
};
const langCSV_default = {
en: "English",
vi: "Vietnam"
};
const network9cBoard = "9c-main"
const nineCMDapi = "https://api.tanvpn.tk";
const urlArenaData = "https://api.9capi.com/arenaLeaderboard";
const url9cscanApi = "https://api.9cscan.com";
const urlAllAvatarHaveDCC = "https://api.dccnft.com/v1/9c/avatars/all";
const networkCSV9cBoard = "9c-main";
const urlsCSVDataFirst = [
	`${nineCMDapi}/get9cBoardCSV?network=${networkCSV9cBoard}&csv=ItemRequirementSheet`,
	`https://raw.githubusercontent.com/planetarium/NineChronicles/${pathNineChronicles}/nekoyume/Assets/StreamingAssets/Localization/item_name.csv`,
	`https://raw.githubusercontent.com/planetarium/NineChronicles/${pathNineChronicles}/nekoyume/Assets/StreamingAssets/Localization/world_name.csv`,
	`https://raw.githubusercontent.com/planetarium/NineChronicles/${pathNineChronicles}/nekoyume/Assets/StreamingAssets/Localization/rune_name.csv`,
	// Thêm các URL khác nếu cần
];

const fileNamesCSVDataFirst = [
	"ItemRequirementSheet",
	"item_name",
	"world_name",
	"rune_name",
	// Thêm các tên tệp khác nếu cần
];