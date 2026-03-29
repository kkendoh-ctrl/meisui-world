// めいすいくん総選挙 - 建物解放システム
// 建物リスト定義、アンロック判定、Firebase同期、通知表示

// ========== 建物リスト（累計票数で発動） ==========
const buildingsList = [
    // 序盤（1〜5票）
    { id: "house", name: "おうち", unlock_votes: 1, category: "住居", emoji: "🏠" },
    { id: "school", name: "がっこう", unlock_votes: 3, category: "教育", emoji: "🏫" },
    // 中盤（5〜12票）
    { id: "park", name: "こうえん", unlock_votes: 5, category: "環境", emoji: "🌳" },
    { id: "library", name: "としょかん", unlock_votes: 7, category: "文化", emoji: "📚" },
    { id: "hospital", name: "びょういん", unlock_votes: 9, category: "医療", emoji: "🏥" },
    { id: "station", name: "えき", unlock_votes: 11, category: "交通", emoji: "🚉" },
    // 後半（13〜20票）
    { id: "fire_station", name: "しょうぼうしょ", unlock_votes: 13, category: "防災", emoji: "🚒" },
    { id: "community_center", name: "こうみんかん", unlock_votes: 15, category: "交流", emoji: "🏛️" },
    { id: "museum", name: "はくぶつかん", unlock_votes: 17, category: "文化", emoji: "🏛️" },
    { id: "city_hall", name: "しやくしょ", unlock_votes: 19, category: "行政", emoji: "🏢" },
    // 終盤（20〜22票）
    { id: "cultural_hall", name: "ぶんかかいかん", unlock_votes: 20, category: "文化", emoji: "🎭" },
    { id: "sanbanze", name: "さんばんせかんさつかん", unlock_votes: 12, category: "自然", emoji: "🌊", special: true },
];

// ========== キャラ別建物（各キャラへの投票数で発動） ==========
const charBuildingsList = [
    // イチョウめいすいくん → 自然・緑化
    { id: "ginkgo_park", name: "イチョウこうえん", char: "meisui", unlock_votes: 2, emoji: "🌳" },
    { id: "botanical_garden", name: "しょくぶつえん", char: "meisui", unlock_votes: 5, emoji: "🌿" },
    { id: "forest_school", name: "もりのがっこう", char: "meisui", unlock_votes: 8, emoji: "🏕️" },
    // ツツジめいちゃん → 花・子育て
    { id: "flower_road", name: "はなみち", char: "tsutsuji", unlock_votes: 2, emoji: "🌸" },
    { id: "nursery", name: "ほいくえん", char: "tsutsuji", unlock_votes: 5, emoji: "👶" },
    { id: "kids_plaza", name: "こどもひろば", char: "tsutsuji", unlock_votes: 8, emoji: "🎠" },
    // ビーナスめいちゃん → 観光・リゾート
    { id: "beach_house", name: "うみのいえ", char: "meisui_chan", unlock_votes: 2, emoji: "🏖️" },
    { id: "hotel", name: "ホテル", char: "meisui_chan", unlock_votes: 5, emoji: "🏨" },
    { id: "aquarium", name: "すいぞくかん", char: "meisui_chan", unlock_votes: 8, emoji: "🐠" },
    // 海めいすいくん → 海・環境
    { id: "fishing_pier", name: "つりばし", char: "bekabune", unlock_votes: 2, emoji: "🎣" },
    { id: "marine_center", name: "うみのセンター", char: "bekabune", unlock_votes: 5, emoji: "🐬" },
    { id: "coral_reef", name: "サンゴしょく", char: "bekabune", unlock_votes: 8, emoji: "🪸" },
    // 屋形船めいすいくん → 伝統・文化
    { id: "shrine", name: "じんじゃ", char: "asari", unlock_votes: 2, emoji: "⛩️" },
    { id: "festival_hall", name: "おまつりかいかん", char: "asari", unlock_votes: 5, emoji: "🏮" },
    { id: "fireworks_spot", name: "はなびスポット", char: "asari", unlock_votes: 8, emoji: "🎆" },
    // 漁師めいすいくん → 商業・産業
    { id: "fish_shop", name: "さかなや", char: "ryoushi", unlock_votes: 2, emoji: "🐟" },
    { id: "market", name: "いちば", char: "ryoushi", unlock_votes: 5, emoji: "🏪" },
    { id: "port", name: "みなと", char: "ryoushi", unlock_votes: 8, emoji: "⚓" },
];

// 建設済み建物リスト（localStorageから復元）
// try-catch: 保存データが破損していても確実に空配列で起動できるようにする
let builtBuildings = [];
try {
    builtBuildings = JSON.parse(localStorage.getItem('meisui_builtBuildings') || '[]');
    if (!Array.isArray(builtBuildings)) builtBuildings = [];
} catch (e) {
    console.warn('建物データの読み込み失敗（データリセット）:', e);
    builtBuildings = [];
    localStorage.removeItem('meisui_builtBuildings');
}

// Firebase同期: 建物アンロック状態を全端末で共有
firebaseDb.ref('stats/builtBuildings').on('value', snap => {
    const data = snap.val();
    if (data && Array.isArray(data)) {
        builtBuildings = data;
        localStorage.setItem('meisui_builtBuildings', JSON.stringify(builtBuildings));
    }
});

// 初回ロード時に建物状態を静かに同期（通知なし）
function silentBuildingSync() {
    const effective = getEffectiveVotes();
    let changed = false;
    buildingsList.forEach(b => {
        if (effective >= b.unlock_votes && !builtBuildings.includes(b.id)) {
            builtBuildings.push(b.id);
            changed = true;
        }
    });
    charBuildingsList.forEach(b => {
        const cv = Math.max(0, (votes[b.char] || 0) - (decorationOffset[b.char] || 0));
        if (cv >= b.unlock_votes && !builtBuildings.includes(b.id)) {
            builtBuildings.push(b.id);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('meisui_builtBuildings', JSON.stringify(builtBuildings));
        saveBuildingsToFirebase();
    }
}

function saveBuildingsToFirebase() {
    firebaseDb.ref('stats/builtBuildings').set(builtBuildings).catch(err => {
        console.error('建物同期失敗:', err);
    });
}

function checkBuildingUnlock() {
    const effective = getEffectiveVotes();
    let newUnlock = false;

    // 累計票数ベースの建物
    buildingsList.forEach(building => {
        if (effective >= building.unlock_votes && !builtBuildings.includes(building.id)) {
            builtBuildings.push(building.id);
            newUnlock = true;
            queueEvent(() => showBuildingNotification(building));
        }
    });

    // キャラ別票数ベースの建物
    charBuildingsList.forEach(building => {
        const charVotes = Math.max(0, (votes[building.char] || 0) - (decorationOffset[building.char] || 0));
        if (charVotes >= building.unlock_votes && !builtBuildings.includes(building.id)) {
            builtBuildings.push(building.id);
            newUnlock = true;
            const meta = charMetadata[building.char];
            queueEvent(() => showBuildingNotification({
                ...building,
                charName: meta ? meta.name : '',
                charColor: meta ? meta.color : '#ffd700'
            }));
        }
    });

    if (newUnlock) {
        localStorage.setItem('meisui_builtBuildings', JSON.stringify(builtBuildings));
        saveBuildingsToFirebase();
    }
}

function showBuildingNotification(building) {
    playSound('unlock');

    const emojiIcon = building.emoji || '🏗️';
    const charLine = building.charName ? `<div style="font-size:14px;color:#aaa;margin-top:4px;">${building.charName}の力で建設！</div>` : '';

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size:24px;font-weight:bold;color:#fff;">
            ${emojiIcon} ${building.name}が たった！
        </div>
        ${charLine}
    `;

    pm.show('toast', content, { duration: 3000, onDone: onEventDone });
}
