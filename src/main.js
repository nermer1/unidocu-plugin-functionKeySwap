/**
 * functionKeyCompat — 솔루션 버전마다 다른 펑션키(F8·F9 등) 배치를 고객사 기준으로 맞추는 플러그인.
 *
 * 예) 솔루션 A: F8 디버그 / F9 테스트,  솔루션 B: F8 조회 / F9 디버그
 *     → B 고객사 config에 { F8: 'F9', F9: 'F8' } 를 주면 F8 이 디버그로 동작.
 *
 * 동작:
 *  - 코어 단축키 처리는 $(document).keydown (document 버블 단계). 코어가 먼저 로드돼 같은 자리에선 늘 코어가 먼저 실행됨.
 *  - 그래서 window 캡처 단계(경로의 맨 처음)에서 키를 먼저 받아, 매핑된 키만 전파를 끊고
 *    바꾼 키 코드로 jQuery keydown 을 다시 발생시켜 코어 로직(권한 체크 포함)을 그대로 태움.
 *  - jQuery trigger 는 실제 키 이벤트를 만들지 않으므로 이 리스너에 다시 걸리지 않음(반복 없음).
 *  - 매핑에 없는 키, Ctrl/Alt/Shift/Meta 조합은 건드리지 않고 그대로 통과.
 */

const config = {
    name: 'functionKeyCompat'
};

// 'F1'~'F12' 이름 ↔ 키 코드 (112~123). 숫자 키 코드로 적어도 됨
const keyCodeOf = (k) => {
    if (typeof k === 'number') return k;
    const m = /^F(\d{1,2})$/i.exec(String(k).trim());
    if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return 111 + Number(m[1]);
    const n = Number(k);
    return isNaN(n) ? null : n;
};

let $plugin;

$u.plugins.addPlugin(config.name, {
    config: config,
    init: () => $plugin.bind()
});

$plugin = {
    // options.map → {원래 키 코드: 바꿀 키 코드}. 잘못된 항목은 무시
    map: () => {
        const opt = ($u.plugins.getOptions(config.name) || {}).map || {};
        const out = {};
        Object.keys(opt).forEach((from) => {
            const f = keyCodeOf(from);
            const t = keyCodeOf(opt[from]);
            if (f !== null && t !== null && f !== t) out[f] = t;
        });
        return out;
    },

    bind: () => {
        const map = $plugin.map();
        if (!Object.keys(map).length) return; // 매핑 없으면 아무것도 안 함
        window.addEventListener(
            'keydown',
            (e) => {
                const to = map[e.keyCode];
                if (!to || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
                e.stopPropagation(); // 원래 키는 코어까지 안 내려감
                e.preventDefault();
                $(document).trigger($.Event('keydown', {which: to, keyCode: to}));
            },
            true // 캡처 단계: 코어($(document).keydown)보다 먼저 받음
        );
    }
};
