// めいすいくん総選挙 - Firebase初期化
// world.htmlから分離

firebase.initializeApp({
    apiKey: "AIzaSyCitq3ZmZ2lbF_mPSermXvbEE77X0jJW2o",
    authDomain: "meisui-world.firebaseapp.com",
    databaseURL: "https://meisui-world-default-rtdb.firebaseio.com",
    projectId: "meisui-world",
    storageBucket: "meisui-world.firebasestorage.app",
    messagingSenderId: "966808863030",
    appId: "1:966808863030:web:a1b85eb17974162c673397"
});
const firebaseDb = firebase.database();
const votesRef = firebaseDb.ref('votes');

// 接続状態の監視
firebaseDb.ref('.info/connected').on('value', (snap) => {
    const indicator = document.getElementById('firebaseStatus');
    if (indicator) {
        if (snap.val()) {
            indicator.style.display = 'none';
        } else {
            indicator.style.display = 'block';
            indicator.style.background = '#f44336';
            indicator.style.color = 'white';
            indicator.textContent = '⚠ オフライン - 投票が同期されません';
        }
    }
});

// グローバル変数初期化
var votes = { meisui: 0, meisui_chan: 0, tsutsuji: 0, bekabune: 0, asari: 0, ryoushi: 0 };
var totalVotes = 0;
var worldLineOffset = 0;
var cycleStartVotes = 0;
var decorationOffset = { meisui: 0, tsutsuji: 0, meisui_chan: 0, bekabune: 0, asari: 0, ryoushi: 0 };
var endingActive = false;
var isInitialLoad = true;
