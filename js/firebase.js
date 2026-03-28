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

// 接続状態の監視（再接続時にデータを再同期）
firebaseDb.ref('.info/connected').on('value', (snap) => {
    const indicator = document.getElementById('firebaseStatus');
    if (!indicator) return;

    if (snap.val()) {
        // オンライン復帰 → 最新データを取得して再同期
        indicator.style.display = 'none';
        if (typeof handleVoteSnapshot === 'function') {
            votesRef.once('value').then(s => handleVoteSnapshot(s)).catch(err => {
                console.error('再同期失敗:', err);
            });
        }
    } else {
        // オフライン → 警告表示
        indicator.style.display = 'block';
        indicator.style.background = '#f44336';
        indicator.style.color = 'white';
        indicator.textContent = '⚠ オフライン - 再接続を待っています...';
    }
});

// グローバル状態変数（CHAR_TYPESから動的に初期化）
let votes = Object.fromEntries(CHAR_TYPES.map(t => [t, 0]));
let totalVotes = 0;
let worldLineOffset = 0;
let cycleStartVotes = 0;
let decorationOffset = Object.fromEntries(CHAR_TYPES.map(t => [t, 0]));
let endingActive = false;
let isInitialLoad = true;
